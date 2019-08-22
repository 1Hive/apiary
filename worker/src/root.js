import { call, all } from 'cofx'
import { Stopwatch } from './utils/stopwatch'
import * as eth from './eth'
import * as app from './app'
import * as org from './org'

export const CHECKPOINT_DURATION = 10 * 1000
export function * root (
  ctx
) {
  const stopwatch = new Stopwatch()
  const startBlock = process.env.START_BLOCK
    || (yield call(ctx.cache.get, 'checkpoint'))
    || 6592900
  const targetBlock = process.env.TARGET_BLOCK || 'latest'
  let block = yield call(eth.fetchBlockUntil,
    ctx,
    startBlock,
    targetBlock
  )

  ctx.log.info({
    startBlock,
    targetBlock
  }, 'Worker started.')

  while (block) {
    const processingStart = process.hrtime.bigint()
    ctx.log.debug({
      block: block.number
    }, `Processing block #${block.number}`)

    // Fetch transactions and logs
    const transactions = yield call(eth.fetchTransactions, ctx, block)
    const logs = (yield all(
      transactions.map((tx) => call(eth.fetchLogs, ctx, tx)
    ))).flat()

    // Persist app installs
    yield eth.processLogs(
      ctx,
      app.LOG_APP_INSTALLED,
      logs,
      app.persistInstall
    )

    // Persist published app versions
    yield eth.processLogs(
      ctx,
      app.LOG_APP_VERSION_PUBLISHED,
      logs,
      app.persistVersion
    )

    // Persist organisation names
    yield eth.processTransactions(
      ctx,
      org.KIT_SIGNATURES,
      org.KIT_ADDRESSES,
      transactions,
      org.persistName
    )

    // Set checkpoint if some specific time has elapsed
    if (stopwatch.elapsed() >= CHECKPOINT_DURATION) {
      ctx.log.info({
        block: block.number
      }, `Set checkpoint @ ${block.number}`)

      yield call(ctx.cache.set, 'checkpoint', block.number)
      yield call([stopwatch, 'reset'])
    }

    const processingTime = (process.hrtime.bigint() - processingStart) / BigInt(1000000)
    ctx.log.debug({
      block: block.number,
      elapsed: processingTime.toString()
    }, `Processed block #${block.number}`)
    block = yield call(eth.fetchBlockUntil,
      ctx,
      block.number + 1,
      targetBlock
    )
  }
}
