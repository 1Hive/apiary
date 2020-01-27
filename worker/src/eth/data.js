import { call } from 'cofx'
import { sql } from 'sqliterally'
import _ from 'lodash'

export function * fetchDataAtBlock (
  ctx,
  blockNumber
) {
  const q = sql`
    select
      tx.block_number,
      tx.hash,
      tx.from,
      tx.to,
      tx.input,
      tx.timestamp,
      log.data,
      log.topics,
      log.address
    from tx
    left join log on log.transaction_hash = tx.hash
    where tx.status = true and tx.block_number = ${blockNumber}
  `
  const result = yield call([ctx.ethstore, 'query', {
    name: 'get-block-data',
    text: q.text,
    values: q.values
  }])

  if (result.rowCount === 0) {
    ctx.log.warn({
      block: blockNumber
    }, 'Block was empty, skipping to next block.')
  }

  const transactionFields = _.partialRight(_.pick, [
    'hash',
    'from',
    'to',
    'input',
    'timestamp'
  ])
  const logFields = _.partialRight(_.pick, [
    'address',
    'data',
    'topics',
    'timestamp'
  ])
  const uniqueTransactions = _.partialRight(_.uniqBy, 'hash')
  return {
    block: {
      number: blockNumber
    },
    transactions: result.rows
      .filter(uniqueTransactions)
      .map(transactionFields),
    logs: result.rows
      .map(logFields)
      .filter(({ address }) => !_.isEmpty(address))
  }
}
