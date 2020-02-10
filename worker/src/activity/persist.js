import { call } from 'cofx'
import { safeUpsert } from '../db'

export async function appExists (ctx, address) {
  const exists = await ctx.db.collection('orgs').find({
    'apps.address': address
  }).limit(1).hasNext()

  return exists
}

export function * persist (
  ctx,
  trace
) {
  // Find actions in the trace that are to known apps
  const actions = []
  for (const action of trace.actions) {
    const exists = yield call(appExists, ctx, action.to)

    if (exists) actions.push(action)
  }

  // This was not a transaction sent to an app
  if (actions.length === 0) return

  // Parse trace actions
  const activity = {
    transactionHash: trace.transactionHash,
    timestamp: trace.timestamp,
    actions
  }

  ctx.log.info({
    transactionHash: activity.transactionHash,
    timestamp: activity.timestamp
  }, 'Activity logged.')

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
