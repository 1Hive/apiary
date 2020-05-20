import os from 'os'
import {
  Worker,
  isMainThread,
  parentPort,
  workerData
} from 'worker_threads'
import Web3 from 'web3'
import { createMongo, createPostgres } from './db'
import createCache from './cache'
import createLogger from 'pino'
import createProvider from './provider'
import {
  handleTask,
  HANDLERS
} from './handlers'

async function fetchTasks (ctx, name, from, count) {
  return new Promise((resolve, reject) => {
    ctx.cache.client.xreadgroup(
      'GROUP',
      'workers',
      name,
      'BLOCK',
      1000,
      'COUNT',
      from === '>' ? count : 1,
      'STREAMS',
      'tasks',
      from,
      (err, res) => {
      if (err) {
        reject(err)
        return
      }

      // Timed out
      if (res === null) {
        resolve([null, true])
        return
      }

      // Empty reply
      const entries = res[0][1]
      if (entries.length === 0) {
        resolve([null, false])
        return
      }

      // Parse tasks
      const tasks = entries.map(([id, props]) => ({
        id,
        data: JSON.parse(props[1])
      }))

      resolve([tasks, false])
    })
  })
}

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
    cache: await createCache(
      process.env.REDIS_URL || 'redis://localhost:6379'
    ),
    log: createLogger({
      level: process.env.LOG_LEVEL || 'info'
    }),
    web3: new Web3(createProvider())
  }

  // The main thread spawns workers and coordinates tasks,
  // while the worker threads process tasks.
  let name = process.env.DYNO || os.hostname()
  if (isMainThread) {
    const concurrency = Math.max(process.env.CONCURRENCY || 5, 1)
    context.log.info({
      concurrency,
      name
    }, 'Started main worker.')

    // Whether we are looking at task history
    // as opposed to new tasks
    let catchup = true
    let pendingTasks = []

    async function getTask () {
      // Refill pending tasks
      if (pendingTasks.length <= 1) {
        while (true) {
          const [tasks, timeout] = await fetchTasks(
            context, name, catchup ? 0 : '>', concurrency
          )

          if (tasks === null && !timeout) {
            catchup = false
            continue
          }
          if (tasks === null) continue

          pendingTasks = pendingTasks.concat(tasks)
          break
        }
      }

      return pendingTasks.shift()
    }

    // Spawn workers
    const workers = []
    for (let i = 0; i < concurrency; i++) {
      const worker = new Worker(__filename, {
        workerData: {
          id: i
        }
      })
      worker.on('message', async (message) => {
        switch (message.type) {
          case 'JOB_FAIL':
            catchup = true
            break
        }

        worker.postMessage(await getTask())
      })
      worker.on('error', (err) => {
        context.log.error({
          workerId: i,
          error: err.toString()
        }, 'Worker thread crashed.')
        process.exit(1)
      })
      worker.once('online', async () => {
        worker.postMessage(await getTask())
      })

      workers.push(worker)
    }
  } else {
    name = `${name}-${workerData.id}`
    context.log.info({
      name
    }, 'Started worker thread.')

    const handler = handleTask(context, HANDLERS)
    parentPort.on('message', async (task) => {
      try {
        await handler(task)
        context.cache.client.multi()
          .sadd('completed', task.id)
          .xack('tasks', 'workers', task.id)
          .exec()
        parentPort.postMessage({
          type: 'JOB_SUCCESS',
          workerId: workerData.id
        })
      } catch (err) {
        // Task failed to process.
        context.cache.client.lpush('errors', JSON.stringify({
          task: task.id,
          err: err.toString()
        }))
        parentPort.postMessage({
          type: 'JOB_FAIL',
          workerId: workerData.id
        })
      }
    })
  }
})()
