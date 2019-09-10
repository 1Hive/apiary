import { task } from 'cofx'
import Web3 from 'web3'
import schedule from 'node-schedule'
import createDb from './db'
import createCache from './cache'
import createLogger from 'pino'
import createProvider from './provider'
import { root } from './root'
import * as tasks from './task'

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

  const metricTasks = [
    ['*/5 * * * *', tasks.appInstalls]
  ]

  // Run metric tasks on start up
  metricTasks.forEach(([_, task]) => task(context)())

  // Run metric tasks periodically
  metricTasks.forEach(
    ([period, task]) => schedule.scheduleJob(period, task(context))
  )

  // Run the block processor
  try {
    await task({
      fn: root,
      args: [context]
    })
  } catch (error) {
    context.log.fatal({ error: error.stack }, 'Block processor crashed.')
    process.exit(1)
  }

  context.log.info('Block processor finished.')
  process.exit(0)
})()
