import { call } from 'cofx'
import * as eth from '../eth'
import * as activity from '../activity'
import ensureDeps from '../utils/task-deps'

export function * persist (ctx, task) {
	yield call(ensureDeps, ctx, task.data.dependencies)
  const traces = yield eth.fetchTraces(ctx, task.data.blockNumber)
  yield eth.processTraces(
    ctx,
    traces,
    activity.persist
  )
}
