import { call, all } from 'cofx'
import abi from 'web3-eth-abi'

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
