import { getContext, takeEvery, put } from 'redux-saga/effects'

export default function * () {
  const web3 = yield getContext('web3')
  yield takeEvery('daolist/eth/TRANSACTION', function * ({
    payload: transaction
  }) {
    const { logs } = yield web3.eth.getTransactionReceipt(transaction.hash)

    for (const log of logs) {
      log.timestamp = transaction.timestamp
      yield put({
        type: 'daolist/eth/LOG',
        payload: log
      })
    }
  })
}
