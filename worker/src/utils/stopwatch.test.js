import { Stopwatch } from './stopwatch'

function sleep (duration = 10) {
  return new Promise((resolve) => {
    setTimeout(resolve, duration)
  })
}

test('Stopwatch: returns elapsed time', async () => {
  const stopwatch = new Stopwatch()

  await sleep(10)
  expect(stopwatch.elapsed()).toBeGreaterThan(0)
})

test('Stopwatch: resets elapsed time', async () => {
  const stopwatch = new Stopwatch()

  await sleep(10)
  const a = stopwatch.elapsed()

  stopwatch.reset()

  await sleep(20)
  const b = stopwatch.elapsed()

  expect(a).toBeLessThan(b)
})
