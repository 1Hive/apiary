import { MongoClient } from 'mongodb'
import assert from 'assert'

export default function createDb () {
  return new Promise((resolve) => {
    // Create a new MongoClient
    const client = new MongoClient(
      process.env.MONGODB_URI || 'mongodb://localhost:27017'
    )

    // Use connect method to connect to the Server
    client.connect((err) => {
      assert.strictEqual(null, err)
      resolve(client.db(process.env.MONGODB_NAME || 'daolist'))
    })
  })
}

export async function createIndexes (db) {
  await db.createIndex('orgs', 'address', { unique: true })
  await db.createIndex('apps', 'repository', { unique: true })
}

export function safeUpsert (collection, filter, update) {
  return collection
    .updateOne(filter, update, { upsert: true })
    .catch(_ => collection.updateOne(filter, update))
}
