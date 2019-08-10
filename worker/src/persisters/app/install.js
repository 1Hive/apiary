import { getContext, takeEvery, fork } from 'redux-saga/effects'
import ENS from 'ethjs-ens'
import { safeUpsert } from '../../utils/index'

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
    yield safeUpsert(
      orgs,
      { address: appInstall.dao },
      {
        $addToSet: {
          apps: {
            id: appInstall.appId,
            address: appInstall.address
          }
        }
      }
    )
  })
}
