import {
  getContext,
  take
} from 'redux-saga/effects'

export default function * () {
  const db = yield getContext('db')
  const log = yield getContext('log')

  const orgs = db.collection('orgs')
  while (true) {
    const { payload: dao } = yield take('daolist/dao/DAO_CREATED')

    log.info('DAO found', { dao })

    yield orgs.updateOne(
      { name: dao.name },
      { $set: dao },
      { upsert: true }
    )
  }
}
