const micro = require('micro')
const cors = require('micro-cors')()
const setupDb = require('./db')

const server = (db) => micro(cors(async () => {
  return db.collection('orgs').find({}).toArray()
}))

setupDb()
  .then((db) => server(db))
  .then((server) => server.listen(process.env.PORT || 3000))
