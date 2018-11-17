const EventEmitter = require('events')
const { runSaga } = require('redux-saga')
const main = require('./root')

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
