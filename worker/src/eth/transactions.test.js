import { call, all } from 'cofx'
import { fetchTransactions, processTransactions } from './transactions'

test('fetchTransactions: returns timestamped transactions for block', () => {
  const context = {}
  const block = {
    timestamp: 1234,
    transactions: [{
      to: '0x1'
    }, {
      to: '0x2'
    }]
  }

  const actual = fetchTransactions(context, block)

  expect(actual).toEqual(block.transactions)
  expect(
    actual.every(({ timestamp }) => timestamp === block.timestamp)
  ).toBe(true)
})

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
