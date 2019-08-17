import { GraphQLServer } from 'graphql-yoga'
import setupDb from './db'
import typeDefs from './schema'
import resolvers from './resolvers'

setupDb()
  .then((db) => {
    return new GraphQLServer({
      typeDefs,
      resolvers,
      context: { db }
    })
  })
  .then((server) => {
    server.start({ port: process.env.PORT || 3000 })
  })
