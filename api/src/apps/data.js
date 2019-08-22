import { makeConnection } from '../pagination'
import {
  transformStringFilter,
  transformDateFilter
} from '../filter'
import {
  camelToSnakeCaseKeys
} from '../utils'

export function getApps (db, args) {
  const filter = {}

  if (args.filter && args.filter.name) {
    filter['name'] = transformStringFilter(
      args.filter.name
    )
  }

  if (args.filter && args.filter.createdAt) {
    filter['created_at'] = transformDateFilter(
      args.filter.createdAt
    )
  }

  return makeConnection(
    db.collection('apps'),
    args,
    filter,
    camelToSnakeCaseKeys(args.sort)
  )
}
