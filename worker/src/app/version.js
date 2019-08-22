import { call } from 'cofx'
import abi from 'web3-eth-abi'
import got from 'got'
import path from 'path'
import { safeUpsert } from '../db'

export const NULL_ADDRESS = '0x0000000000000000000000000000000000000000'

export function fetchIpfsAsset (uri, file) {
  const extension = file.split('.').pop()

  let url = file
  if (!url.includes('http')) {
    url = new URL(path.join('ipfs', uri, file), process.env.IPFS_URI)
  }

  return got(url.toString(), {
    json: extension === 'json'
  }).then(({ body }) => body, () => null)
}

export async function fetchVersion (web3, repository, versionId) {
  const call = abi.encodeFunctionCall({
    name: 'getByVersionId',
    type: 'function',
    inputs: [{
      type: 'uint256',
      name: '_versionId'
    }]
  }, [versionId])

  const result = await web3.eth.call({
    to: repository,
    data: call
  })

  const { semanticVersion, contractAddress, contentURI } = abi.decodeParameters([{
    type: 'uint16[3]',
    name: 'semanticVersion'
  }, {
    type: 'address',
    name: 'contractAddress'
  }, {
    type: 'bytes',
    name: 'contentURI'
  }], result)

  const content = web3.utils.hexToAscii(contentURI)
  if (!content.includes(':') && contractAddress === NULL_ADDRESS) {
    // If the content URI is malformed and there is no implementation address,
    // then we skip this app as it is possibly another type of content published
    // over APM.
    return null
  }

  const [type, uri] = content.split(':')

  let manifest = {}
  let artifact = {}
  if (type === 'ipfs' && uri) {
    manifest = (await fetchIpfsAsset(uri, 'manifest.json')) || {}
    artifact = (await fetchIpfsAsset(uri, 'artifact.json')) || {}
  }

  let details
  if (manifest && manifest.details_url) {
    details = await fetchIpfsAsset(uri, manifest.details_url)
  }

  return {
    app: {
      // Technical stuff
      hash: artifact.appId,
      ens: artifact.appName,
      repository,

      // Human stuff
      name: manifest.name,
      author: manifest.author,
      description: manifest.description,
      details,
      source_url: manifest.source_url,
      changelog_url: manifest.changelog_url,
      screenshots: manifest.screenshots
    },
    version: {
      id: versionId,
      version: semanticVersion.join('.'),
      implementation: contractAddress,
      content: {
        type,
        uri
      }
    }
  }
}

export function * persistVersion (
  ctx,
  log
) {
  const versionInfo = yield call(
    fetchVersion,
    ctx.web3,
    log.address,
    log.parameters.versionId
  )

  if (!versionInfo) return

  ctx.log.info({
    repository: log.address,
    semantic: log.parameters.semanticVersion
  }, 'New version published for app')

  yield call(
    safeUpsert,
    ctx.db.collection('apps'),
    { repository: log.address },
    {
      $set: versionInfo.app,
      $addToSet: {
        versions: versionInfo.version
      }
    }
  )
}
