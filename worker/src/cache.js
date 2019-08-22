import redis from 'redis'
import { promisify } from 'util'

export default function createCache () {
  return new Promise((resolve) => {
    // Create a new Redis client
    const client = redis.createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379'
    })

    const get = promisify(client.get).bind(client)
    const set = promisify(client.set).bind(client)
    resolve({
      get,
      set
    })
  })
}
