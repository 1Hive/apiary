import micro from 'micro'
import cors from 'micro-cors'
import setupDb from './db'

const server = (db) => micro(cors()(async () => {
  return db.collection('orgs').find().sort({ _id: -1 }).toArray()
}))

setupDb()
  .then((db) => server(db))
  .then((server) => server.listen(process.env.PORT || 3000))
