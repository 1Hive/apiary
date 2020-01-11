import { call, all } from 'cofx'
import got from 'got'

export function fetchTracesFromEthEvents (transactionHashes) {
  return got.post(`${process.env.ETH_EVENTS_URL}/trace/search/`, {
    headers: {
      Authorization: `Bearer ${process.env.ETH_EVENTS_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      query: {
        bool: {
          filter: {
            terms: {
              transactionHash: transactionHashes
            }
          }
        }
      }
    })
  })
    .then(({ body }) => JSON.parse(body))
    .then(({ hits }) => {
      return hits.hits.map((hit) => hit._source)
    })
}

export function * fetchTraces (
  ctx,
  transactionHashes
) {
  return yield call(fetchTracesFromEthEvents, transactionHashes)
}

export function processTraces (
  ctx,
  traces,
  fn
) {
  return all(
    traces.map((trace) => call(fn, ctx, trace))
  )
}
