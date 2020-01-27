import { call } from 'cofx'
import { appScores, appInstalls } from '../task'

export function * scores (ctx) {
  yield call(appScores(ctx))
}

export function * installs (ctx) {
  yield call(appInstalls(ctx))
}
