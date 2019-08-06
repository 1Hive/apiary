import {
  all
} from 'redux-saga/effects'
import name from './name'

export default function * () {
	yield all([
		name()
	])
}
