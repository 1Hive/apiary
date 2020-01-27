import { call } from 'cofx'
import { appScores } from '../task'

export function * scores (ctx) {
	yield call(appScores(ctx))
}
