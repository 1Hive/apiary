import { call, all } from 'cofx'
import { processTransactions } from './transactions'

test('processTransactions: only processes transactions with known address and method id', () => {
  const context = 'ctx'
  const mockCallback = jest.fn()
  const transactions = [{
    to: '0x1',
    input: '0xaaaaaaaa'
  }, {
    to: '0x2',
    input: '0xbbbbbbbb'
  }]

  const noMatchingAddressEffect = processTransactions(
    context,
    new Map(),
    new Set(['0x3']),
    transactions,
    mockCallback
  )

  expect(noMatchingAddressEffect).toEqual(all([]))

  const noMatchingMethodIdEffect = processTransactions(
    context,
    new Map(),
    new Set(['0x1']),
    transactions,
    mockCallback
  )

  expect(noMatchingMethodIdEffect).toEqual(all([]))

  const matchingTransactionsEffect = processTransactions(
    context,
    new Map([
      ['0xaaaaaaaa', []]
    ]),
    new Set(['0x1']),
    transactions,
    mockCallback
  )

  expect(matchingTransactionsEffect).toEqual(
    all([
      call(mockCallback, context, transactions[0])
    ])
  )
})
