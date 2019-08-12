import { getContext, takeEvery } from 'redux-saga/effects'

export default function * () {
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
