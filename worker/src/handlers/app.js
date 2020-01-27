import { call } from 'cofx'
import * as eth from '../eth'
import * as app from '../app'

export function * persistInstall (
  ctx,
  task
) {
  const { logs } = yield call(
    eth.fetchDataAtBlock,
    ctx,
    task.data.blockNumber
  )
  yield eth.processLogs(
    ctx,
    app.LOG_APP_INSTALLED,
    logs,
    app.persistInstall
  )
}

export function * persistVersion (
  ctx,
  task
) {
  const { logs } = yield call(
    eth.fetchDataAtBlock,
    ctx,
    task.data.blockNumber
  )
  yield eth.processLogs(
    ctx,
    app.LOG_APP_VERSION_PUBLISHED,
    logs,
    app.persistVersion
  )
}
