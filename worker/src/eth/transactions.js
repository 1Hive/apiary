import { call, all } from 'cofx'
import abi from 'web3-eth-abi'

export function fetchTransactions (
  _,
  block
) {
  return block.transactions.map((tx) => {
    tx.timestamp = block.timestamp

    return tx
  })
}

export function processTransactions (
  ctx,
  abiMap,
  whitelist,
  transactions,
  fn
) {
  return all(
    transactions
      .filter(({ to }) => whitelist.has(to) || whitelist.size === 0)
      .filter(({ input }) => abiMap.has(input.slice(0, 10)))
      .map((tx) => {
        const jsonInterface = abiMap.get(tx.input.slice(0, 10))
        tx.parameters = abi.decodeParameters(
          jsonInterface,
          '0x' + tx.input.slice(10)
        )

        return tx
      })
      .map((tx) => call(fn, ctx, tx))
  )
}
