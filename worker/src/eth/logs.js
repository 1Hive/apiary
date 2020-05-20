import { call, all } from 'cofx'
import abi from 'web3-eth-abi'
import { sql } from 'sqliterally'

export function * fetchLogs (
  ctx,
  blockNumber
) {
  const q = sql`
    select
      tx.timestamp,
      log.data,
      log.topics,
      log.address
    from tx
    inner join log on log.transaction_hash = tx.hash
    where tx.status = true and tx.block_number = ${blockNumber}
  `
  const result = yield call([ctx.ethstore, 'query', {
    name: 'get-logs',
    text: q.text,
    values: q.values
  }])

  if (result.rowCount === 0) {
    ctx.log.debug({
      block: blockNumber
    }, 'Block had no logs.')
  }

  return {
    block: {
      number: blockNumber
    },
    logs: result.rows
  }
}

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
