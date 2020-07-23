const { ApolloServer } = require('apollo-server')
const { HttpLink } = require('apollo-link-http')
const fetch = require('node-fetch')
const {
  introspectSchema,
  linkToExecutor,
  wrapSchema,
  stitchSchemas,
  FilterRootFields
} = require('graphql-tools')
const DataLoader = require('dataloader')
const { MongoClient } = require('mongodb')

async function connectToDatabase() {
  const db = await MongoClient.connect(process.env.MONGO_URL)

  return {
    profiles: db.collection('profiles')
  }
}

async function buildSchema(loaders) {
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
      'repos'
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
  `

  // Merge the remote schemas with the local type defs
  return stitchSchemas({
    subschemas: [{
      schema: aragonConnectSchema,
      transforms: aragonConnectSchemaTransforms,
    }],
    typeDefs: localTypeDefs,
    resolvers: {
      Organization: {
        profile: {
          selectionSet: `{ address }`,
          async resolve(org) {
            return loaders.profileLoader.load(org.address)
          }
        }
      }
    }
  })
}

connectToDatabase().then(async (db) => {
  const profileLoader = new DataLoader((keys) => {
    return db.profiles.find({ address: { $in: keys } }).toArray()
  })
  const schema = await buildSchema({
    profileLoader
  })

  // Start the GraphQL server
  const server = new ApolloServer({ schema })

  server.listen().then(({ url }) => {
    console.log(`Server listening at ${url}`)
  })
})

