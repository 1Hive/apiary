import EventEmitter from 'events'
import { runSaga, stdChannel } from 'redux-saga'
import main from './root'

const emitter = new EventEmitter()
const channel = stdChannel()

emitter.on('action', channel.put)

runSaga({
  channel,
  dispatch (output) {
    emitter.emit('action', output)
  },
  getState () {
    return {}
  }
}, main)
