import { call, all } from 'cofx'
import { processLogs } from './logs'

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
