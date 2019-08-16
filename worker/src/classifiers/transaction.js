import { getContext, take, put } from 'redux-saga/effects'
import _ from 'lodash'
import abi from 'web3-eth-abi'
import kits from '../data/kits'

export default function * () {
  const web3 = yield getContext('web3')
  const log = yield getContext('log')

  const kitAdresses = _.keys(kits)
  while (true) {
    const { payload: transaction } = yield take('daolist/eth/TRANSACTION')

    // We only want transactions to DAO kits
    if (!kitAdresses.includes(transaction.to)) continue

    log.info('Transaction sent to known kit', {
      kit: {
        address: transaction.to,
        name: kits[transaction.to].name
      }
    })

    const kit = kits[transaction.to]
    const methodId = web3.eth.abi.encodeFunctionSignature(kit.abi)

    // We only want transactions with whitelisted method IDs
    if (transaction.input.slice(0, 10) !== methodId) {
      log.info('Unknown method signature called on kit', {
        kit: {
          address: transaction.to,
          name: kits[transaction.to].name
        }
      })
      continue
    }

    // Get the DAO name
    const { name } = abi.decodeParameters(
      kit.abi.inputs,
      '0x' + transaction.input.slice(10)
    )

    yield put({
      type: 'daolist/dao/DAO_CREATED',
      payload: {
        block: transaction.blockNumber,
        kit: transaction.to,
        creator: transaction.from,
        transaction: transaction.hash,
        name: `${name}.aragonid.eth`,
        timestamp: transaction.timestamp
      }
    })
  }
}
