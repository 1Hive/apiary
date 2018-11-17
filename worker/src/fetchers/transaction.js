const {
  take,
  put
} = require('redux-saga/effects')

module.exports = function * transactionFetcher () {
  while (true) {
    const { payload: { transactions } } = yield take('daolist/eth/BLOCK')

    for (let transaction of transactions) {
      yield put({
        type: 'daolist/eth/TRANSACTION',
        payload: transaction
      })
    }
  }
}
