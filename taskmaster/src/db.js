import pg from 'pg'
import redis from 'redis'
import { promisify } from 'util'

export function createCache (url) {
  return new Promise((resolve) => {
    // Create a new Redis client
    const client = redis.createClient({
      url
    })

    const get = promisify(client.get).bind(client)
    const set = promisify(client.set).bind(client)
    resolve({
      get,
      set,
      client
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
