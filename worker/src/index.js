import EventEmitter from 'events'
import { runSaga } from 'redux-saga'
import main from './root'

const emitter = new EventEmitter()

runSaga(
  {
    subscribe (cb) {
      emitter.on('event', (event) => cb(event))

      return () => emitter.removeAllListeners()
    },
    dispatch (event) {
      emitter.emit('event', event)
    },
    getState () {
      return {}
    }
  },
  main
)
