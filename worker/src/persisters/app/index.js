import {
  all
} from 'redux-saga/effects'
import install from './install'
import update from './update'
import metadata from './metadata'

export default function * () {
	yield all([
		install(),
		update(),
		metadata()
	])
}
