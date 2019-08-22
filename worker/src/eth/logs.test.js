import { call, all } from 'cofx'
import Web3 from 'web3'
import FakeProvider from 'web3-fake-provider'
import { genTester, yields, finishes } from 'gen-tester'
import { fetchLogs, processLogs } from './logs'

test('fetchLogs: returns timestamped logs for transaction', () => {
  const context = {
    web3: new Web3(new FakeProvider())
  }
  const receipt = {
    logs: [{
      address: '0x1'
    }, {
      address: '0x2'
    }]
  }
  const tx = {
    hash: '0x',
    timestamp: 1234
  }

  const tester = genTester(fetchLogs, context, tx)
  const { actual, expected } = tester(
    yields(
      call([context.web3.eth, 'getTransactionReceipt', tx.hash]), receipt
    ),
    finishes(receipt.logs)
  )

  expect(
    actual[1].every(({ timestamp }) => timestamp === tx.timestamp)
  ).toBe(true)
  expect(actual).toEqual(expected)
})

test('processLogs: only processes logs with matching signature', () => {
  const context = 'ctx'
  const mockCallback = jest.fn()
  const logs = [{
    topics: ['foo']
  }, {
    topics: ['bar']
  }]

  const noMatchingLogsEffect = processLogs(
    context,
    ['baz', []],
    logs,
    mockCallback
  )

  expect(noMatchingLogsEffect).toEqual(all([]))

  const matchingLogsEffect = processLogs(
    context,
    ['bar', []],
    logs,
    mockCallback
  )

  expect(matchingLogsEffect).toEqual(
    all([
      call(mockCallback, context, logs[1])
    ])
  )
})
