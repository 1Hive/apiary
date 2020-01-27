import { MongoClient } from 'mongodb'
import pg from 'pg'
import assert from 'assert'

export function createMongo (connectionString, database) {
  return new Promise((resolve) => {
    // Create a new MongoClient
    const client = new MongoClient(
      connectionString,
      { ignoreUndefined: true }
    )

    // Use connect method to connect to the Server
    client.connect((err) => {
      assert.strictEqual(null, err)
      resolve(client.db(database))
    })
  })
}

export async function createPostgres (connectionString) {
  const client = new pg.Client({
    connectionString
  })
  await client.connect()

  return client
}

export function safeUpsert (collection, filter, update) {
  return collection
    .updateOne(filter, update, { upsert: true })
    .catch(_ => collection.updateOne(filter, update))
}
