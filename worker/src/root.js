import {
  setContext,
  fork
} from 'redux-saga/effects'
import Web3 from 'web3'
import * as winston from 'winston'
import createDb from './db'
import createCache from './cache'

// Sagas
import blockFetcher from './fetchers/block'
import transactionFetcher from './fetchers/transaction'
import transactionClassifier from './classifiers/transaction'
import daoPersister from './persisters/dao'

export default function * main () {
  // Create context
  const context = {
    db: yield createDb(),
    cache: yield createCache(),
    web3: new Web3(
      new Web3.providers.WebsocketProvider(
        process.env.ETH_NODE || 'wss://mainnet.infura.io/ws', {
        clientConfig: {
          maxReceivedFrameSize: 100000000,
          maxReceivedMessageSize: 100000000,
        }
      })
    ),
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
