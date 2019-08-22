import { call } from 'cofx'
import { safeUpsert } from '../db'

export function getKernelAddress (web3, address) {
  const data = web3.eth.abi.encodeFunctionCall({
    name: 'kernel',
    type: 'function',
    inputs: []
  }, [])

  return web3.eth.call({
    to: address,
    data
  }).then((ret) => web3.eth.abi.decodeParameter('address', ret))
}

export function * persistInstall (
  ctx,
  log
) {
  const orgAddress = yield call(getKernelAddress, ctx.web3, log.parameters.proxy)
  ctx.log.info({
    appId: log.parameters.appId,
    proxy: log.parameters.proxy,
    organisation: orgAddress
  }, 'App installed')

  yield call(
    safeUpsert,
    ctx.db.collection('orgs'),
    { address: orgAddress },
    {
      $addToSet: {
        apps: {
          id: log.parameters.appId,
          address: log.parameters.proxy
        }
      },
      $min: {
        created_at: log.timestamp
      }
    }
  )
}
