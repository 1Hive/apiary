import {
  setContext,
  all
} from 'redux-saga/effects'
import Web3 from 'web3'
import * as winston from 'winston'
import createDb from './db'
import createCache from './cache'

// Sagas
import blockFetcher from './fetchers/block'
import transactionFetcher from './fetchers/transaction'
import logsFetcher from './fetchers/logs'
import transactionClassifier from './classifiers/transaction'
import eventClassifier from './classifiers/event'
import appPersister from './persisters/app/index'
import daoPersister from './persisters/dao/index'

export async function createIndexes (db) {
  await db.createIndex('orgs', 'address', { unique: true })
  await db.createIndex('apps', 'address', { unique: true })
}

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
            maxReceivedMessageSize: 100000000
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
  yield createIndexes(context.db)

  // Start sagas
  yield all([
    blockFetcher(),
    transactionFetcher(),
    logsFetcher(),

    eventClassifier(),
    transactionClassifier(),

    daoPersister(),
    appPersister()
  ])
}
