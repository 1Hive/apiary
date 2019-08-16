import { take, put } from 'redux-saga/effects'

export default function * transactionFetcher () {
  while (true) {
    const {
      payload: block
    } = yield take('daolist/eth/BLOCK')

    for (const transaction of block.transactions) {
      transaction.timestamp = block.timestamp
      yield put({
        type: 'daolist/eth/TRANSACTION',
        payload: transaction
      })
    }
  }
}
