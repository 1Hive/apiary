import {
  getContext,
  takeEvery,
  put
} from 'redux-saga/effects'
import abi from 'web3-eth-abi'

export default function * () {
  const web3 = yield getContext('web3')
  const log = yield getContext('log')
  yield takeEvery('daolist/eth/TRANSACTION', function * ({
    payload: transaction
  }) {
    const { logs } = yield web3.eth.getTransactionReceipt(
      transaction.hash
    )

    for (let log of logs) {
      yield put({
        type: 'daolist/eth/LOG',
        payload: log
      })
    }
  })
}
