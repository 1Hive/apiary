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

  if (args.filter && args.filter.kit) {
    filter.kit = transformStringFilter(
      args.filter.kit
    )
  }

  if (args.filter && args.filter.createdAt) {
    filter.created_at = transformDateFilter(
      args.filter.createdAt
    )
  }

  const query = db.collection('orgs')
  return makeConnection(
    query,
    args,
    filter,
    camelToSnakeCaseKeys(args.sort)
  ).then(withOrgStats(query, { ...filter }))
}

export async function updateProfile (
  db,
  args
) {
  const { ens, ...updateParams } = args
  const { profile = {} } = await db.collection('orgs').findOne({ ens })
  await db.collection('orgs').updateOne(
    { ens },
    { $set: { profile: { ...profile, ...updateParams } } })
  return db.collection('orgs').findOne({ ens })
}

export async function getSingleOrganisation (
  db,
  args
) {
  const { address } = args
  return db.collection('orgs').findOne({ address })
}

const withOrgStats = (query, filter) => async function (data) {
  return {
    ...data,
    ...(await fetchOrgStats(query, filter))
  }
}

async function fetchOrgStats (query, filter) {
  const { totalAUM, totalActivity } = await query.aggregate([{
    $match: filter
  }, {
    $group: {
      _id: null,
      totalAUM: { $sum: '$aum' },
      totalActivity: { $sum: '$activity' }
    }
  }]).next()
  return { totalAUM, totalActivity }
}
