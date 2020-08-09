import { ApolloServer } from 'apollo-server'
import { HttpLink } from 'apollo-link-http'
import fetch from 'node-fetch'
import {
  introspectSchema,
  linkToExecutor,
  wrapSchema,
  stitchSchemas,
  delegateToSchema,
  FilterRootFields,
  TransformQuery
} from 'graphql-tools'
import { Kind } from 'graphql'
import { MongoClient } from 'mongodb'
import { validateEnvironment, toNetworkAddress, fromNetworkAddress } from './utils'
import { validateSignerAddress, composeMessage, validatePermission } from './eth'
import { buildProfileLoader, buildOrgLoader } from './loaders'

async function connectToDatabase () {
  const client = await MongoClient.connect(process.env.MONGODB_URI)
  const db = client.db(process.env.MONGODB_NAME)

  return {
    profiles: db.collection('profiles'),
    organizations: db.collection('organizations'),
    upvotes: db.collection('upvotes')
  }
}

async function buildSchema ({
  loaders,
  db
}) {
  const aragonConnectExecutor = linkToExecutor(new HttpLink({
    uri: process.env.GRAPH_ARAGON_CONNECT,
    fetch
  }))

  // Pull Aragon Connect schema from introspection query
  const schema = await introspectSchema(aragonConnectExecutor)

  // Make it an executable schema
  const aragonConnectSchema = wrapSchema({
    schema,
    executor: aragonConnectExecutor
  })

  // This defines a set of transforms that will
  // make the Aragon Connect schema more useable
  // for our use-case.
  const aragonConnectSchemaTransforms = [
    new FilterRootFields((_, rootField) => [
      'organizations',
      'organization',
      'repos',
      'orgFactories'
    ].includes(rootField))
  ]

  // Local schema that extends the remote schema
  const localTypeDefs = `
    extend enum Organization_orderBy {
      upvotes
    }

    type Profile {
      name: String
      icon: String
      links: [String]!
      editors: [String]!
      description: String
    }

    extend type Organization {
      profile: Profile!
      upvotes: Int!
    }

    type Mutation {
      # Update organization profile.
      updateProfile(
        # The organization address
        adress: String!,
        # The desired organization name.
        name: String,
        # An URL to the desired organization icon.
        icon: String,
        # A list of links relevant to the organization.
        links: [String],
        # An organization description.
        description: String,
        # The address of the signer.
        signerAddress: String!,
        # The signed message.
        signedMessage: String!
      ): Organization!
      # Upvote organization.
      upvoteOrganization(
        # The organization address
        address: String!,
        # The address of the signer.
        signerAddress: String!,
        # The signed message.
        signedMessage: String!
      ): Organization!
    }
  `

  // Merge the remote schemas with the local type defs
  return stitchSchemas({
    subschemas: [{
      schema: aragonConnectSchema,
      transforms: aragonConnectSchemaTransforms
    }],
    typeDefs: localTypeDefs,
    resolvers: {
      Query: {
        async organizations (_, args, context, info) {
          if (args.orderBy === 'upvotes') {
            const sortedOrgs = await db.organizations.find()
              .skip(args.skip)
              .limit(args.first)
              .sort({
                upvotes: args.orderDirection === 'asc' ? 1 : -1
              })
              .toArray()

            const orgAddresses = sortedOrgs.map(
              ({ address }) => fromNetworkAddress(address)
            )

            // Add `id_in` to the delegated query
            args.where = args.where || {}
            args.where.id_in = orgAddresses

            const orgs = await delegateToSchema({
              schema: aragonConnectSchema,
              operation: 'query',
              fieldName: 'organizations',
              args,
              context,
              info,
              transforms: [
                new TransformQuery({
                  path: ['organizations'],
                  queryTransformer (subtree) {
                    subtree.selections.push({
                      kind: Kind.FIELD,
                      name: {
                        kind: Kind.NAME,
                        value: 'address'
                      }
                    })
                    return subtree
                  }
                })
              ]
            })

            // The results we get from the subschema are not necessarily ordered,
            // so we have to reorder them again here.
            return orgs.sort((a, b) => {
              if (orgAddresses.indexOf(a.address) < orgAddresses.indexOf(b.address)) {
                return -1
              }

              if (orgAddresses.indexOf(a.address) > orgAddresses.indexOf(b.address)) {
                return 1
              }

              return 0
            })
          }

          return delegateToSchema({
            schema: aragonConnectSchema,
            operation: 'query',
            fieldName: 'organizations',
            args,
            context,
            info
          })
        }
      },
      Organization: {
        profile: {
          selectionSet: `{ address }`,
          async resolve (org) {
            const profile = await loaders.profileLoader.load(
              toNetworkAddress(org.address)
            ) || {}
            profile.links = profile.links || []
            profile.editors = profile.editors || []

            return profile
          }
        },
        upvotes: {
          selectionSet: `{ address }`,
          async resolve ({ address }) {
            const org = await loaders.orgLoader.load(
              toNetworkAddress(address)
            ) || {}

            return org.upvotes || 0
          }
        }
      },
      Mutation: {
        async updateProfile (_, args, context, info) {
          const {
            address,
            signerAddress,
            signedMessage,
            ...profile
          } = args

          const originalMessage = composeMessage('PROFILE_DATA', {
            address,
            profileName: profile.name,
            profileDescription: profile.description,
            profileIcon: profile.icon,
            profileLinks: profile.links
          })
          const isValidSignature = validateSignerAddress(
            originalMessage,
            signedMessage,
            signerAddress
          )
          if (!isValidSignature) {
            throw new Error('Failed to verify signed message.')
          }

          // Profiles start out being editable by anyone unless
          // it has been claimed.
          const currentProfile = await db.profiles.find({
            address
          }).limit(1).next()
          let isOpen = true
          if (currentProfile && currentProfile.editors) {
            isOpen = currentProfile.editors.length === 0
          }

          const hasPermission = await validatePermission(
            address,
            signerAddress
          )
          if (!hasPermission && !isOpen) {
            throw new Error(`Provided address ${signerAddress} does not have relevant permissions.`)
          }

          const changeset = { $set: { ...profile } }
          if (hasPermission) {
            changeset['$addToSet'] = { editors: signerAddress }
          }

          await db.profiles.updateOne({ address: toNetworkAddress(address) }, changeset)

          return delegateToSchema({
            schema: aragonConnectSchema,
            operation: 'query',
            fieldName: 'organization',
            args: {
              id: address
            },
            context,
            info
          })
        },
        async upvoteOrganization (_, args, context, info) {
          const {
            address,
            signerAddress,
            signedMessage,
          } = args

          const originalMessage = composeMessage('UPVOTE_DATA', {
            address
          })
          const isValidSignature = validateSignerAddress(
            originalMessage,
            signedMessage,
            signerAddress
          )
          if (!isValidSignature) {
            throw new Error('Failed to verify signed message.')
          }

          // Check if this account has already upvoted the specific organization.
          const hasAlreadyUpvoted = await db.upvotes.find({
            organization: toNetworkAddress(address),
            address: signerAddress
          }).limit(1).hasNext()
          if (!hasAlreadyUpvoted) {
            await db.upvotes.insertOne({
              organization: toNetworkAddress(address),
              address: signerAddress
            })
            await db.organizations.updateOne({
              address: toNetworkAddress(address)
            }, {
              $inc: {
                upvotes: 1
              }
            })
          }

          return delegateToSchema({
            schema: aragonConnectSchema,
            operation: 'query',
            fieldName: 'organization',
            args: {
              id: address
            },
            context,
            info
          })
        }
      }
    }
  })
}

(async function () {
  validateEnvironment([
    'NETWORK_ID',
    'GRAPH_ARAGON_CONNECT',
    'MONGODB_URI',
    'MONGODB_NAME'
  ])

  // Connect to the database and build the schema
  const db = await connectToDatabase()
  const schema = await buildSchema({
    loaders: {
      profileLoader: buildProfileLoader(db.profiles),
      orgLoader: buildOrgLoader(db.organizations)
    },
    db
  })

  // Start the GraphQL server
  const server = new ApolloServer({ schema })
  server.listen(process.env.PORT || 4000).then(({ url }) => {
    console.log(`Server listening at ${url}`)
  })

  // Organization lookup table
  //
  // Every few minutes we download a local copy of the addresses
  // of every existing organization from the Aragon Connect subgraph.
  // 
  // We do this to have a local index so we can add custom properties
  // we can sort by, such as scores.
  const TEN_MINUTES = 60 * 10 * 1000
  async function syncOrgAddresses (page) {
    const ITEMS_PER_PAGE = 200
    const data = await fetch(process.env.GRAPH_ARAGON_CONNECT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `{
          organizations(
            skip: ${ITEMS_PER_PAGE * page}
            first: ${ITEMS_PER_PAGE}
          ) {
            address
          }
        }`
      })
    })
      .then((res) => res.json())
      .then((res) => res.data)

    if (data.organizations.length === 0) {
      // There is no more data, so we sync again in 10 minutes.
      setTimeout(() => {
        syncOrgAddresses(0)
      }, TEN_MINUTES)
    } else {
      // Upsert database with new organizations
      const bulk = db.organizations.initializeUnorderedBulkOp()
      for (const org of data.organizations) {
        bulk.find({
          address: toNetworkAddress(org.address)
        })
          .upsert()
          .updateOne({
            $setOnInsert: { upvotes: 0 }
          })
      }
      await bulk.execute()
      console.log(`Synchronized ${data.organizations.length} organizations from The Graph.`)

      // Synchronize next page
      await syncOrgAddresses(page + 1)
    }
  }
  syncOrgAddresses(0)
})()
