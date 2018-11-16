const {
  setContext,
  fork
} = require('redux-saga/effects')
const Web3 = require('web3')
const winston = require('winston')
const createDb = require('./db')
const createCache = require('./cache')

// Sagas
const blockFetcher = require('./fetchers/block')
const transactionFetcher = require('./fetchers/transaction')
const transactionClassifier = require('./classifiers/transaction')
const daoPersister = require('./persisters/dao')

module.exports = function * main () {
  // Create context
  const context = {
    db: yield createDb(),
    cache: yield createCache(),
    web3: new Web3(process.env.ETH_NODE || 'wss://mainnet.infura.io/ws'),
    log: winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      transports: [
        new winston.transports.Console({
          format: process.env.NODE_ENV === 'production'
            ? winston.format.json()
            : winston.format.cli()
        })
      ]
    })
  }
  yield setContext(context)

  // Start sagas
  yield [
    fork(blockFetcher),
    fork(transactionFetcher),
    fork(transactionClassifier),
    fork(daoPersister)
  ]
}
