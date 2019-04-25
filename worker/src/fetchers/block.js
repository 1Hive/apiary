import {
  delay
} from 'redux-saga'
import {
  getContext,
  put,
  all
} from 'redux-saga/effects'
import _ from 'lodash'
import { promisify } from 'util'

export function * chunks (min, max, chunkSize) {
  yield* _.chunk(
    _.range(min, max),
    chunkSize
  )
}

const FETCH_CHUNK_SIZE = 50
export function * catchUpFromBlock ({
  web3,
  log,
  cache
}, cursor) {
  let latestBlock = yield web3.eth.getBlockNumber()
  if (latestBlock <= cursor) {
    return cursor
  }

  for (let chunk of chunks(cursor, latestBlock, FETCH_CHUNK_SIZE)) {
    const blocks = yield all(
      chunk.map((block) => web3.eth.getBlock(block, true))
    )

    // If any of the blocks were null then we have to retry
    // again later
    if (blocks.includes(null)) {
      log.debug('A block could not be fetched, trying again later...', { cursor })
      return cursor
    }
    cursor += chunk.length

    // Periodically checkpoint progress by setting block cursor in cache
    yield cache.set('block', cursor)
    log.info('Set checkpoint', { cursor, latestBlock })

    yield all(
      blocks.map((block) => put({
        type: 'daolist/eth/BLOCK',
        payload: block
      }))
    )
  }

  return cursor
}

const ONE_MINUTE = 60 * 1000
const GENESIS_DAO_BLOCK = 6593345
export default function * blockFetcher () {
  const web3 = yield getContext('web3')
  const cache = yield getContext('cache')
  const log = yield getContext('log')

  // Make the cache a bit nicer to use
  const get = promisify(cache.get).bind(cache)
  const set = promisify(cache.set).bind(cache)

  // Get the starting block from cache, otherwise default to
  // earliest known DAO
  let cursor = (
    parseInt(yield get('block'), 10)
  ) || GENESIS_DAO_BLOCK

  log.info('Started', { cursor })

  while (true) {
    // Catch up from cursor to latest block
    cursor = yield * catchUpFromBlock({
      web3,
      log,
      cache: { set, get }
    }, cursor)

    // Wait a few seconds before catching up again
    yield delay(ONE_MINUTE)
  }
}
