import { call, all } from 'cofx'
import abi from 'web3-eth-abi'
import { sql } from 'sqliterally'

export function * fetchTransactions (
  ctx,
  blockNumber
) {
  const q = sql`
    select
      tx.hash,
      tx.from,
      tx.to,
      tx.input,
      tx.timestamp
    from tx
    where tx.status = true and tx.block_number = ${blockNumber}
  `
  const result = yield call([ctx.ethstore, 'query', {
    name: 'get-transactions',
    text: q.text,
    values: q.values
  }])

  if (result.rowCount === 0) {
    ctx.log.debug({
      block: blockNumber
    }, 'Block had no transactions.')
  }

  return {
    block: {
      number: blockNumber
    },
    transactions: result.rows
  }
}

export function processTransactions (
  ctx,
  abiMap,
  whitelist,
  transactions,
  fn
) {
  // Whitelisted transactions
  const whitelisted = transactions.filter(
    ({ to }) => whitelist.has(to) || whitelist.size === 0
  )

  // Transactions sent with a known ABI
  const known = whitelisted.filter(
    ({ input }) => abiMap.has(input.slice(0, 10))
  )

  // Decoded transactions
  const decoded = known.map((tx) => {
    const jsonInterface = abiMap.get(tx.input.slice(0, 10))
    tx.parameters = abi.decodeParameters(
      jsonInterface,
      '0x' + tx.input.slice(10)
    )

    return tx
  })

  const effects = decoded.map(
    (tx) => call(fn, ctx, tx)
  )
  return all(effects)
}
