import { call, task } from 'cofx'
import createLogger from 'pino'
import { sql } from 'sqliterally'
import schedule from 'node-schedule'
import { createPostgres, createCache } from './db'
import { delay } from './utils'

export const ORG_NAMES = 'ORG/NAME'
export const APP_INSTALLS = 'APP/INSTALL'
export const APP_VERSIONS = 'APP/VERSION'
export const PERSIST_ACTIVITY = 'ACTIVITY/PERSIST'
export const CHECKPOINT = 'CORE/CHECKPOINT'
export const METRIC_SCORES = 'METRIC/SCORES'
export const METRIC_INSTALLS = 'METRIC/INSTALLS'

export function initStream (ctx) {
  return new Promise((resolve, reject) => {
    ctx.cache.client.xgroup('CREATE', 'tasks', 'workers', '0', 'MKSTREAM', (err) => {
      if (err) {
        if (err.code !== 'BUSYGROUP') {
          reject(err)
          return
        }
      }

      resolve()
    })
  })
}

export function createJob (
  ctx,
  def
) {
  return new Promise((resolve, reject) => {
    ctx.cache.client.xadd('tasks', '*', 'message', JSON.stringify(def), (err, res) => {
      if (err) {
        reject(err)
        return
      }

      resolve(res)
    })
  })
}

export async function scheduleBlock (
  ctx,
  blockNumber,
  previousBlockHandle = null
) {
  const rootTasks = [
    ORG_NAMES,
    APP_INSTALLS,
    APP_VERSIONS
  ].map((type) => ({
    type,
    blockNumber,
    dependencies: []
  }))

  // Schedule root tasks
  const jobHandles = await Promise.all(rootTasks.map(
    (def) => createJob(ctx, def)
  ))

  // Schedule activity persistance task
  const activityJobHandle = await createJob(ctx, {
    type: PERSIST_ACTIVITY,
    blockNumber,
    dependencies: jobHandles
  })

  // Schedule checkpointing task
  const handle = await createJob(ctx, {
    type: CHECKPOINT,
    blockNumber,
    dependencies: previousBlockHandle
      ? [activityJobHandle, previousBlockHandle]
      : [activityJobHandle]
  })

  return handle
}

export async function getHighestBlock (ctx) {
  const q = sql`select max(number) - 20 as max from block`
  const { rows } = await ctx.ethstore.query({
    name: 'get-latest-block',
    text: q.text,
    values: q.values
  })

  if (rows.length === 0) {
    throw new Error('Could not get latest block.')
  }

  return rows[0].max
}

export async function getStartBlock (ctx) {
  const GENESIS_BLOCK = 6592900
  if (process.env.START_BLOCK) {
    return process.env.START_BLOCK
  }

  const cache = await ctx.cache.get('checkpoint')
  if (cache) {
    return cache
  }

  return GENESIS_BLOCK
}

export async function getTargetBlock () {
  return process.env.TARGET_BLOCK || 'latest'
}

const THROTTLE = process.env.THROTTLE
export function * run (ctx) {
  const startBlock = yield call(getStartBlock, ctx)
  const targetBlock = yield call(getTargetBlock)
  let highestBlock = yield call(getHighestBlock, ctx)

  ctx.log.info({
    startBlock,
    targetBlock,
    highestBlock
  }, 'Taskmaster started.')

  let currentBlock = startBlock
  let previousBlockHandle = null
  while (
    // eslint-disable-next-line no-unmodified-loop-condition
    currentBlock <= targetBlock || targetBlock === 'latest'
  ) {
    previousBlockHandle = yield call(scheduleBlock, ctx, currentBlock, previousBlockHandle)
    ctx.log.info({
      block: currentBlock
    }, 'Scheduled block')

    while (currentBlock >= highestBlock) {
      yield call(delay, 10 * 1000)
      highestBlock = yield call(getHighestBlock, ctx)
    }

    if (THROTTLE) {
      yield call(delay, THROTTLE)
    }

    currentBlock++
  }
}

(async () => {
  // Create context
  const context = {
    ethstore: await createPostgres(
      process.env.ETH_EVENTS_URI
    ),
    cache: await createCache(
      process.env.REDIS_URL || 'redis://localhost:6379'
    ),
    log: createLogger({
      level: process.env.LOG_LEVEL || 'info'
    })
  }

  await initStream(context)

  // Set up periodic tasks
  schedule.scheduleJob('* * */2 * *', () =>
    createJob(context, {
      type: METRIC_SCORES,
      dependencies: []
    })
  )
  schedule.scheduleJob('*/5 * * * *', () =>
    createJob(context, {
      type: METRIC_INSTALLS,
      dependencies: []
    })
  )

  // Run the taskmaster
  try {
    await task({
      fn: run,
      args: [context]
    })
  } catch (error) {
    context.log.fatal({ error: error.stack }, 'Taskmaster crashed.')
    process.exit(1)
  }

  context.log.info('Taskmaster finished.')
  process.exit(0)
})()
