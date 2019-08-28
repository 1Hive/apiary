import { task } from 'cofx'
import Web3 from 'web3'
import createDb, { createIndexes } from './db'
import createCache from './cache'
import createLogger from 'pino'
import createProvider from './provider'
import { root } from './root'

(async () => {
  // Create context
  const context = {
    db: await createDb(),
    cache: await createCache(),
    log: createLogger(
      { level: process.env.LOG_LEVEL || 'info' }
    ),
    web3: new Web3(createProvider())
  }

  // Run the worker
  try {
    await task({
      fn: root,
      args: [context]
    })
  } catch (error) {
    context.log.fatal({ error: error.stack }, 'Worker crashed.')
    process.exit(1)
  }

  context.log.info('Worker finished.')
})()
