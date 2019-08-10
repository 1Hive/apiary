import { getContext, take } from 'redux-saga/effects'
import { safeUpsert } from '../../utils/index'

export default function * () {
  const web3 = yield getContext('web3')
  const db = yield getContext('db')
  const log = yield getContext('log')

  const orgs = db.collection('orgs')
  while (true) {
    const { payload: dao } = yield take('daolist/dao/DAO_CREATED')

    log.info('DAO name set', { dao })

    const address = yield web3.eth.ens.getAddress(dao.name)
    dao.address = address

    yield safeUpsert(orgs, { address }, { $set: dao })
  }
}
