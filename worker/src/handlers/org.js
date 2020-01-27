import { call } from 'cofx'
import * as eth from '../eth'
import * as org from '../org'

export function * persistName (
  ctx,
  task
) {
  const { transactions } = yield call(
    eth.fetchDataAtBlock,
    ctx,
    task.data.blockNumber
  )
  yield eth.processTransactions(
    ctx,
    org.KIT_SIGNATURES,
    org.KIT_ADDRESSES,
    transactions,
    org.persistName
  )
}
