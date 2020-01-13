import redis from 'redis'
import { promisify } from 'util'

export default function createCache (url) {
  return new Promise((resolve) => {
    // Create a new Redis client
    const client = redis.createClient({
      url
    })

    const get = promisify(client.get).bind(client)
    const set = promisify(client.set).bind(client)
    resolve({
      get,
      set
    })
  })
}
