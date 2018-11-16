const {
  delay
} = require('redux-saga')
const {
  getContext,
  put
} = require('redux-saga/effects')
const { promisify } = require('util')

function * catchUpFromBlock ({
  web3,
  log,
  cache
}, cursor) {
  let latestBlock
  do {
    latestBlock = yield web3.eth.getBlockNumber()
    for (; cursor < latestBlock; cursor++) {
      const block = yield web3.eth.getBlock(cursor, true)

      if (block === null) return cursor

      // Periodically checkpoint progress by setting block cursor in cache
      if (cursor % 100 === 0) {
        yield cache.set('block', cursor)
        log.info('Set checkpoint', { cursor })
      }

      yield put({
        type: 'daolist/eth/BLOCK',
        payload: block
      })
    }
  } while (cursor < latestBlock)

  return cursor
}

const ONE_MINUTE = 60 * 1000
const GENESIS_DAO_BLOCK = 6593345
module.exports = function * blockFetcher () {
  const web3 = yield getContext('web3')
  const cache = yield getContext('cache')
  const log = yield getContext('log')

  // Make the cache a bit nicer to use
  const get = promisify(cache.get).bind(cache)
  const set = promisify(cache.set).bind(cache)

  // Get the starting block from cache, otherwise default to
  // earliest known DAO
  let cursor = (
    yield get('block')
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
