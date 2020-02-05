import Web3 from 'web3'
import Queue from 'bee-queue'
import { createMongo, createPostgres } from './db'
import createCache from './cache'
import createLogger from 'pino'
import createProvider from './provider'
import {
  handleTask,
  HANDLERS
} from './handlers'

(async () => {
  // Create context
  const context = {
    db: await createMongo(
      process.env.MONGODB_URI || 'mongodb://localhost:27017',
      process.env.MONGODB_NAME || 'daolist'
    ),
    ethstore: await createPostgres(
      process.env.ETH_EVENTS_URI
    ),
    queue: new Queue('tasks', {
      redis: {
        url: process.env.REDIS_URL || 'redis://localhost:6379'
      },
      removeOnSuccess: true,
      storeJobs: false,
      isWorker: true
    }),
    cache: await createCache(
      process.env.REDIS_URL || 'redis://localhost:6379'
    ),
    log: createLogger({
      level: process.env.LOG_LEVEL || 'info'
    }),
    web3: new Web3(createProvider())
  }

  // Handle tasks as they come in
  const concurrency = process.env.CONCURRENCY || 5
  context.log.info({
    concurrency
  }, 'Started worker.')
  context.queue.process(
    concurrency,
    handleTask(context, HANDLERS)
  )
})()
