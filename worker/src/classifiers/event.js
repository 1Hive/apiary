import { takeEvery, put } from 'redux-saga/effects'
import abi from 'web3-eth-abi'
import topics from '../data/topics'

export default function * () {
  yield takeEvery('daolist/eth/LOG', function * ({ payload: event }) {
    const timestamp = event.timestamp
    switch (event.topics[0]) {
      case topics.NEW_APP_PROXY:
        const { proxy, appId } = abi.decodeLog(
          [
            {
              type: 'address',
              name: 'proxy'
            },
            {
              type: 'bool',
              name: 'isUpgradeable'
            },
            {
              type: 'bytes32',
              name: 'appId'
            }
          ],
          event.data,
          []
        )

        const appInstall = {
          proxy,
          appId,
          timestamp
        }

        yield put({
          type: 'daolist/dao/APP_INSTALLED',
          payload: appInstall
        })
        break

      case topics.NEW_VERSION:
        const { versionId, semanticVersion } = abi.decodeLog(
          [
            {
              type: 'uint256',
              name: 'versionId'
            },
            {
              type: 'uint16[3]',
              name: 'semanticVersion'
            }
          ],
          event.data,
          []
        )

        const newVersion = {
          id: versionId,
          semantic: semanticVersion,
          repository: event.address,
          timestamp
        }

        yield put({
          type: 'daolist/app/NEW_VERSION',
          payload: newVersion
        })
        break
    }
  })
}
