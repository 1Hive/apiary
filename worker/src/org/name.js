import { call } from 'cofx'
import { safeUpsert } from '../db'

export function * persistName (
  ctx,
  tx
) {
  const ensName = `${tx.parameters.name}.aragonid.eth`
  const address = yield call([ctx.web3.eth.ens, 'getAddress', ensName])

  ctx.log.info({
    organisation: address,
    ens: ensName
  }, 'Organisation ENS name set')

  yield call(
    safeUpsert,
    ctx.db.collection('orgs'),
    { address },
    {
      $set: { ens: ensName },
      $min: {
        created_at: tx.timestamp
      }
    }
  )
}
