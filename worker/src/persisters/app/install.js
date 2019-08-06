import { getContext, takeEvery, fork } from 'redux-saga/effects'
import ENS from 'ethjs-ens'

export default function * () {
  const web3 = yield getContext('web3')
  const db = yield getContext('db')
  const log = yield getContext('log')

  const orgs = db.collection('orgs')
  yield takeEvery('daolist/dao/APP_INSTALLED', function * ({
    payload: appInstall
  }) {
    log.info('App installed', appInstall)

    // Add app to org
    yield orgs.updateOne(
      { address: appInstall.dao },
      {
        $addToSet: {
          apps: {
            id: appInstall.appId,
            address: appInstall.address
          }
        }
      },
      { upsert: true }
    )
  })
}
