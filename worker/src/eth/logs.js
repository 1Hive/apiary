import { call, all } from 'cofx'
import abi from 'web3-eth-abi'

export function processLogs (
  ctx,
  [signature, jsonInterface],
  logs,
  fn
) {
  const matchingSignature = logs.filter(
    ({ topics }) => topics[0] === signature
  )
  const decodedLogs = matchingSignature.map((log) => {
    log.parameters = abi.decodeLog(jsonInterface, log.data)

    return log
  })
  const effects = decodedLogs.map(
    (log) => call(fn, ctx, log)
  )

  return all(effects)
}
