import { getContext, takeEvery, fork } from 'redux-saga/effects'
import abi from 'web3-eth-abi'
import got from 'got'

export function fetchIpfsAsset (uri, file) {
  const extension = file.split('.').pop()
  let url = new URL(file)

  if (!url.hostname) {
    url = new URL(path.join(uri, file), process.env.IPFS_URI)
  }

  return got(url.toString(), {
    json: extension === 'json'
  }).then(({ body }) => body, () => null)
}

// Some core apps of Aragon can be identified by the content URI they
// publish in app versions. For example, APM repositories are
// identified by each content URI of each version for the app
// being `ipfs:repo`.
const KNOWN_APPS_BY_URI = {
  repo: {
    name: 'APM Repository',
    author: 'Aragon Association'
  },
  enssub: {
    name: 'ENS Subdomain Registrar',
    author: 'Aragon Association'
  },
  apm: {
    name: 'APM Registry',
    author: 'Aragon Association'
  }
}

export async function fetchVersion (web3, repository, versionId) {
  const call = abi.encodeFunctionCall(
    {
      name: 'getByVersionId',
      type: 'function',
      inputs: [
        {
          type: 'uint256',
          name: '_versionId'
        }
      ]
    },
    [versionId]
  )

  const result = await web3.eth.call({
    to: repository,
    data: call
  })

  const { semanticVersion, contractAddress, contentURI } = abi.decodeParameters(
    [
      {
        type: 'uint16[3]',
        name: 'semanticVersion'
      },
      {
        type: 'address',
        name: 'contractAddress'
      },
      {
        type: 'bytes',
        name: 'contentURI'
      }
    ],
    result
  )

  const [type, uri] = web3.utils.hexToAscii(contentURI).split(':')

  const isKnownApp = !!KNOWN_APPS_BY_URI[uri]

  let manifest
  let artifact
  if (type === 'ipfs' && uri && !isKnownApp) {
    manifest = (await fetchIpfsAsset(uri, 'manifest.json')) || {}
    artifact = (await fetchIpfsAsset(uri, 'artifact.json')) || {}
  }

  let details
  if (manifest && manifest.details_url && !isKnownApp) {
    details = await fetchIpfsAsset(uri, manifest.details_url)
  }

  if (isKnownApp) {
    manifest = KNOWN_APPS_BY_URI[uri]
  }

  return {
    app: {
      // Technical stuff
      hash: artifact.appId,
      ens: artifact.appName,
      address: repository,

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

export default function * () {
  const web3 = yield getContext('web3')
  const db = yield getContext('db')
  const log = yield getContext('log')

  const apps = db.collection('apps')
  yield takeEvery('daolist/app/NEW_VERSION', function * ({
    payload: newVersion
  }) {
    log.info('New version for app', newVersion)

    const { app, version } = yield fetchVersion(
      web3,
      newVersion.repository,
      newVersion.id
    )

    // Add app to org
    yield apps.updateOne(
      { address: newVersion.repository },
      {
        $set: app,
        $addToSet: {
          versions: version
        }
      },
      { upsert: true }
    )
  })
}
