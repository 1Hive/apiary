const { ApolloServer } = require('apollo-server')
const { HttpLink } = require('apollo-link-http')
const fetch = require('node-fetch')
const {
  introspectSchema,
  linkToExecutor,
  wrapSchema,
  stitchSchemas,
  delegateToSchema,
  FilterRootFields
} = require('graphql-tools')
const DataLoader = require('dataloader')
const { MongoClient } = require('mongodb')
const { toChecksumAddress } = require('ethereumjs-util')
import { validateSignature, validatePermission } from './eth'

async function connectToDatabase () {
  const client = await MongoClient.connect(process.env.MONGODB_URI)
  const db = client.db(process.env.MONGODB_NAME)

  return {
    profiles: db.collection('profiles')
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
    type Profile {
      name: String
      icon: String
      links: [String]!
      editors: [String]!
      description: String
    }

    extend type Organization {
      profile: Profile!
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
      Organization: {
        profile: {
          selectionSet: `{ address }`,
          async resolve (org) {
            const profile = await loaders.profileLoader.load(org.address) || {}

            profile.links = profile.links || []
            profile.editors = profile.editors || []

            return profile
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

          const isValidSignature = validateSignature(
            address,
            profile,
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

          let changeset = { $set: { ...profile } }
          if (hasPermission) {
            changeset['$addToSet'] = { editors: signerAddress }
          }

          await db.profiles.updateOne({ address }, changeset)

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

connectToDatabase().then(async (db) => {
  const profileLoader = new DataLoader(async (keys) => {
    // For some reason addresses in The Graph are not checksummed..
    keys = keys.map((k) => toChecksumAddress(k))
    const results = await db.profiles
      .find({
        address: {
          $in: keys
        }
      })
      .toArray()

    // We have to reorder the results and insert nulls in case
    // the profile does not exist as this is expected by DataLoader.
    const profiles = []
    for (const result of results) {
      profiles[keys.indexOf(result.address)] = result
    }
    for (let i = 0; i < keys.length; i++) {
      if (!profiles[i]) profiles[i] = null
    }
    return profiles
  })
  const schema = await buildSchema({
    loaders: {
      profileLoader
    },
    db
  })

  // Start the GraphQL server
  const server = new ApolloServer({ schema })

  server.listen(process.env.PORT || 4000).then(({ url }) => {
    console.log(`Server listening at ${url}`)
  })
})
