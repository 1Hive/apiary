import { makeConnection } from '../pagination'
import {
  transformStringFilter,
  transformDateFilter
} from '../filter'
import {
  camelToSnakeCaseKeys
} from '../utils'

export function getOrganisations (
  db,
  args
) {
  const filter = {}
  if (args.filter && args.filter.app) {
    filter['apps.id'] = transformStringFilter(
      args.filter.app
    )
  }

  if (args.filter && args.filter.createdAt) {
    filter['created_at'] = transformDateFilter(
      args.filter.createdAt
    )
  }

  return makeConnection(
    db.collection('orgs'),
    args,
    filter,
    camelToSnakeCaseKeys(args.sort)
  )
}
