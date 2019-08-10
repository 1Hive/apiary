import { take, put } from 'redux-saga/effects'

export default function * transactionFetcher () {
  while (true) {
    const {
      payload: { transactions }
    } = yield take('daolist/eth/BLOCK')

    for (let transaction of transactions) {
      yield put({
        type: 'daolist/eth/TRANSACTION',
        payload: transaction
      })
    }
  }
}
