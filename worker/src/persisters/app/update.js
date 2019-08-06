import { getContext, takeEvery, fork } from 'redux-saga/effects'
import ENS from 'ethjs-ens'

export default function * () {
  const web3 = yield getContext('web3')
  const db = yield getContext('db')
  const log = yield getContext('log')

  const orgs = db.collection('orgs')
  yield takeEvery('daolist/dao/APP_UPDATED', function * ({
    payload: appUpdate
  }) {
    log.info('App updated', appUpdate)

    // Update app in org
    yield orgs.updateOne(
      { address: appUpdate.dao },
      {
        $addToSet: {
          apps: appUpdate.appId
        }
      },
      { upsert: true }
    )
  })
}
