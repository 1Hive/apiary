import { call } from 'cofx'

export function * fetchBlockUntil (
  ctx,
  cursor,
  end
) {
  if (cursor > end && end !== 'latest') {
    return
  }

  // Fetch until the block actually exists
  let block = null
  while (block === null) {
    block = yield call([ctx.web3.eth, 'getBlock', cursor, true])
  }

  return block
}
