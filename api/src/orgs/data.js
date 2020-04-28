import Web3EthContract from 'web3-eth-contract'
import kernelAbi from '../abis/kernel.json'
import { makeConnection } from '../pagination'
import {
  transformStringFilter,
  transformDateFilter
} from '../filter'
import {
  camelToSnakeCaseKeys,
  composeSignedMessage
} from '../utils'
import { validateSignerAddress } from '../web3-utils'

const MANAGE_PROFILE_ROLE = '0x675b358b95ae7561136697fcc3302da54a334ac7c199d53621288290fb863f5c'
const EMPTY_SCRIPT = '0x00'

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
  const { address, signerAddress, signedMessage, ...updateParams } = args

  const originalMessage = composeSignedMessage(address, updateParams)
  const isAddressValid = validateSignerAddress(originalMessage, signedMessage, signerAddress)
  Web3EthContract.setProvider('wss://rinkeby.infura.io/ws/v3/a30bd9ef4acd44aba62fa33b0e159b7c')

  const kernelContract = new Web3EthContract(kernelAbi, address)

  try {
    const hasPermission = await kernelContract.methods.hasPermission(
      signerAddress,
      address,
      MANAGE_PROFILE_ROLE,
      EMPTY_SCRIPT
    ).call()
    if (!isAddressValid || !hasPermission) {
      throw new Error('Failed message verification.')
    }
  } catch(err) {
    return
  }

  const { profile = {} } = await db.collection('orgs').findOne({ address })
  const currentEditors = profile.editors || []
  const newEditors = [...currentEditors, signerAddress]

  await db.collection('orgs').updateOne(
    { address },
    { $set: { profile: { ...profile, ...updateParams, editors: newEditors } } })

  return db.collection('orgs').findOne({ address })
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
