import _ from 'lodash'
import { call } from 'cofx'
import { sql } from 'sqliterally'

export async function fetchTracesFromEthEvents (ctx, blockNumber) {
  const q = sql`
    select
      string_to_array(trace_address, ',')::int[] as trace_addr,
      "timestamp",
      "transaction_hash",
      "from",
      "to",
      "input",
      "value",
      "error"
    from trace
    where "block_number" = ${blockNumber} and "status" = true
    order by
      "timestamp" asc,
      "transaction_index" asc,
      "trace_addr" asc
  `

  const { rows } = await ctx.ethstore.query({
    name: 'get-traces',
    text: q.text,
    values: q.values
  })

  const traces = _.chain(rows)
    .filter((row) => row.transaction_hash !== null)
    .groupBy('transaction_hash')
    .map((trace) => {
      const actions = _.chain(trace)
        .map(_.partialRight(_.pick, [
          'to',
          'from',
          'input',
          'error',
          'value'
        ]))
        .map((action) => ({
          ...action,
          to: ctx.web3.utils.toChecksumAddress(action.to),
          from: ctx.web3.utils.toChecksumAddress(action.from)
        }))
        .value()

      return {
        transactionHash: trace[0].transaction_hash,
        timestamp: trace[0].timestamp,
        actions
      }
    })
    .value()

  return traces
}

export function fetchTraces (
  ctx,
  blockNumber
) {
  return call(fetchTracesFromEthEvents, ctx, blockNumber)
}

export function * processTraces (
  ctx,
  traces,
  fn
) {
  for (const trace of traces) {
    yield call(fn, ctx, trace)
  }
}
