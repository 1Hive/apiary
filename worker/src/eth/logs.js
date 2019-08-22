import { call, all } from 'cofx'
import abi from 'web3-eth-abi'

export function * fetchLogs (
  ctx,
  tx
) {
  const { logs } = yield call([ctx.web3.eth, 'getTransactionReceipt', tx.hash])

  return logs.map((log) => {
    log.timestamp = tx.timestamp

    return log
  })
}

export function processLogs (
  ctx,
  [signature, jsonInterface],
  logs,
  fn
) {
  return all(
    logs
      .filter(({ topics }) => topics[0] === signature)
      .map((log) => {
        log.parameters = abi.decodeLog(jsonInterface, log.data)

        return log
      })
      .map((log) => call(fn, ctx, log))
  )
}
