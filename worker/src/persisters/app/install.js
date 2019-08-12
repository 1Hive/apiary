import { getContext, takeEvery } from 'redux-saga/effects'
import { safeUpsert, getKernelAddress } from '../../utils/index'

export default function * () {
  const web3 = yield getContext('web3')
  const db = yield getContext('db')
  const log = yield getContext('log')

  const orgs = db.collection('orgs')
  yield takeEvery('daolist/dao/APP_INSTALLED', function * ({
    payload: appInstall
  }) {
    const address = yield getKernelAddress(web3, appInstall.proxy)
    log.info('App installed', {
      appId: appInstall.appId,
      proxy: appInstall.proxy,
      address
    })

    // Add app to org
    yield safeUpsert(
      orgs,
      { address },
      {
        $addToSet: {
          apps: {
            id: appInstall.appId,
            address: appInstall.proxy
          }
        }
      }
    )
  })
}
