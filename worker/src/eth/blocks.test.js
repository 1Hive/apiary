import { call } from 'cofx'
import Web3 from 'web3'
import FakeProvider from 'web3-fake-provider'
import { genTester, yields, finishes } from 'gen-tester'
import { fetchBlockUntil } from './blocks'

test('fetchBlockUntil: returns block if cursor <= end', () => {
  const context = {
    web3: new Web3(new FakeProvider())
  }

  const tester = genTester(fetchBlockUntil, context, 1, 1)
  const { actual, expected } = tester(
    yields(
      call([context.web3.eth, 'getBlock', 1, true]), { number: 1 }
    ),
    finishes({ number: 1 })
  )

  expect(actual).toEqual(expected)
})

test('fetchBlockUntil: returns undefined if cursor > end', () => {
  const context = {
    web3: new Web3(new FakeProvider())
  }

  const tester = genTester(fetchBlockUntil, context, 2, 1)
  const { actual, expected } = tester(
    finishes(undefined)
  )

  expect(actual).toEqual(expected)
})

test('fetchBlockUntil: returns block if end = latest', () => {
  const context = {
    web3: new Web3(new FakeProvider())
  }

  const tester = genTester(fetchBlockUntil, context, 2, 'latest')

  const { actual, expected } = tester(
    yields(
      call([context.web3.eth, 'getBlock', 2, true]), { number: 2 }
    ),
    finishes({ number: 2 })
  )

  expect(actual).toEqual(expected)
})

test('fetchBlockUntil: tries to refetch block if web3 returns null', () => {
  const context = {
    web3: new Web3(new FakeProvider())
  }

  const tester = genTester(fetchBlockUntil, context, 2, 'latest')

  const { actual, expected } = tester(
    yields(
      call([context.web3.eth, 'getBlock', 2, true]), null
    ),
    yields(
      call([context.web3.eth, 'getBlock', 2, true]), { number: 2 }
    ),
    finishes({ number: 2 })
  )

  expect(actual).toEqual(expected)
})
