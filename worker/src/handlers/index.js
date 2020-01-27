import * as cofx from 'cofx'
import * as org from './org'
import * as app from './app'
import * as activity from './activity'
import * as checkpoint from './checkpoint'
import * as metric from './metric'

export const ORG_NAMES = 'ORG/NAME'
export const APP_INSTALLS = 'APP/INSTALL'
export const APP_VERSIONS = 'APP/VERSION'
export const PERSIST_ACTIVITY = 'ACTIVITY/PERSIST'
export const CHECKPOINT = 'CORE/CHECKPOINT'
export const METRIC_SCORES = 'METRIC/SCORES'
export const METRIC_INSTALLS = 'METRIC/INSTALLS'

export const HANDLERS = {
  // Basic indexing tasks
  [ORG_NAMES]: org.persistName,
  [APP_INSTALLS]: app.persistInstall,
  [APP_VERSIONS]: app.persistVersion,

  // Activity indexing
  [PERSIST_ACTIVITY]: activity.persist,

  // Checkpointing
  [CHECKPOINT]: checkpoint.checkpoint,

  // Periodic tasks
  [METRIC_SCORES]: metric.scores
}

export function handleTask (ctx, handlers) {
  return async function handle (task) {
    const handler = handlers[task.data.type]
    if (!handler) {
      throw new Error(`Unknown task type ${task.data.type}`)
    }

    ctx.log.debug({
      id: task.id,
      type: task.data.type
    }, 'Got task')
    await cofx.task({
      fn: handler,
      args: [ctx, task]
    })
    ctx.log.info({
      id: task.id,
      type: task.data.type
    }, 'Finished task.')
  }
}
