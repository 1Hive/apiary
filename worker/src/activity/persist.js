import { call, all } from 'cofx'
import { safeUpsert } from '../db'

export function * persist (
  ctx,
  trace
) {
  const getApp = (address) => {
    return ctx.db.collection('orgs')
      .find({
        'apps.address': address
      })
      .limit(1)
      .next()
  }

  // Find every app and organization mentioned in this trace
  const appsInTrace = yield all(trace.trace.map(
    ({ action }) => call(getApp, action.to)
  )).filter((res) => res !== null)

  // Find actions in the trace that are to known apps
  const actions = trace.trace.filter((action, index) => {
    return !!appsInTrace.find(
      (app) => app.address === action.to
    )
  }).map((action) => ({
    from: action.from,
    to: action.to,
    data: action.input
  }))

  // Parse trace actions
  const activity = {
    transactionHash: trace.transactionHash,
    timestamp: trace.timestamp,
    actions
  }

  // Persist activity
  yield call(
    safeUpsert,
    ctx.db.collection('activity'),
    { transactionHash: activity.transactionHash },
    {
      $set: activity
    }
  )
}
