import { call } from 'cofx'
import ensureDeps from '../utils/task-deps'

export function * checkpoint (ctx, task) {
  yield call(ensureDeps, ctx, task.data.dependencies)
  ctx.log.info({
    block: task.data.blockNumber
  }, `Set checkpoint @ ${task.data.blockNumber}`)

  yield call(ctx.cache.set, 'checkpoint', task.data.blockNumber)
}
