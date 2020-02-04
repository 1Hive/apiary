import { call } from 'cofx'
import { safeUpsert } from '../db'

export function * persistName (
  ctx,
  tx
) {
  const ensName = `${tx.parameters.name}.aragonid.eth`
  let address
  try {
    address = yield call([ctx.web3.eth.ens, 'getAddress', ensName])
  } catch (_) {
    ctx.log.warn({
      ens: ensName,
      transactionHash: tx.hash
    }, `Malformed name found, aborting decoding.`)
    return
  }

  ctx.log.info({
    organisation: address,
    ens: ensName
  }, 'Organisation ENS name set')

  yield call(
    safeUpsert,
    ctx.db.collection('orgs'),
    { address },
    {
      $set: {
        ens: ensName,
        kit: tx.to
      },
      $min: {
        created_at: tx.timestamp
      }
    }
  )
}
