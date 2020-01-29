import _ from 'lodash'
import {
  getTokenReserves,
  getMarketDetails
} from '@uniswap/sdk'

const TOKEN_ADRESSES = {
  ETH: '0x0000000000000000000000000000000000000000',
  ANT: '0x960b236A07cf122663c4303350609A66A7B288C0',
  DAI: '0x6b175474e89094c44da98b954eedeac495271d0f',
  SAI: '0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359',
  USDC: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'
}
const TOKEN_DECIMALS = {
  ETH: 18,
  ANT: 18,
  DAI: 18,
  SAI: 18,
  USDC: 6
}

function fetchTokenBalance (
  ctx,
  tokenAddress,
  accountAddress
) {
  if (tokenAddress === TOKEN_ADRESSES['ETH']) {
    return ctx.web3.eth.getBalance(accountAddress)
  }

  return ctx.web3.eth.call({
    to: tokenAddress,
    data: ctx.web3.eth.abi.encodeFunctionCall({
      name: 'balanceOf',
      type: 'function',
      inputs: [{
        type: 'address',
        name: 'account'
      }]
    }, [accountAddress])
  }).then(
    (balance) => ctx.web3.eth.abi.decodeParameter('uint256', balance)
  )
}

function fetchOrgs (ctx) {
  return ctx.db.collection('orgs')
    .find()
    .project({ address: 1 })
    .toArray()
}

function fetchApps (ctx) {
  return ctx.db.collection('orgs').aggregate([{
    $unwind: '$apps'
  }, {
    $project: {
      organization: '$address',
      appId: '$apps.id',
      address: '$apps.address'
    }
  }]).toArray()
}

const DAY = 24 * 60 * 60 * 1000
function fetchActivity (ctx) {
  return ctx.db.collection('activity').aggregate([{
    $match: {
      timestamp: {
        $gte: new Date(new Date().getTime() - 90 * DAY)
      }
    }
  }, {
    $unwind: '$actions'
  }, {
    $project: {
      to: '$actions.to'
    }
  }]).toArray()
}

const processSerially = (set, transform) => {
  let current = Promise.resolve()

  return Promise.all(set.map((item) => {
    current = current.then(() => transform(item))
    return current
  }))
}

// TODO This task does not support "time travelling" since it
// always gets the balances of accounts at the highest block
// available on the node.
// TODO Convert balances to DAI
export function appScores (ctx) {
  return async function appScoresCalculator () {
    // Fetch all organization addresses
    const orgs = await fetchOrgs(ctx)

    // Fetch all installed apps
    ctx.log.info('Fetching all apps...')
    const apps = await fetchApps(ctx)

    // Fetch conversion rates
    ctx.log.info('Fetching conversion rates...')
    const rates = {}
    const daiReserves = await getTokenReserves(TOKEN_ADRESSES['DAI'])
    for (const token in TOKEN_ADRESSES) {
      const tokenAddress = TOKEN_ADRESSES[token]
      ctx.log.debug({
        token
      }, 'Fetching conversion rate for token')

      let marketDetails
      if (token === 'ETH') {
        marketDetails = await getMarketDetails(undefined, daiReserves)
      } else {
        const tokenReserves = await getTokenReserves(tokenAddress)
        marketDetails = await getMarketDetails(tokenReserves, daiReserves)
      }
      const rate = marketDetails.marketRate.rate

      rates[tokenAddress] = rate
      ctx.log.debug({
        token,
        rate
      }, 'Got conversion rate')
    }

    // Fetch balances for all installed apps
    ctx.log.info('Fetching all balances...')
    const balances = await processSerially(apps, async (app) => {
      const result = []
      for (const token in TOKEN_ADRESSES) {
        const tokenAddress = TOKEN_ADRESSES[token]
        ctx.log.debug({
          app: app.address,
          token
        }, 'Fetching balance for app')
        const balance = (await fetchTokenBalance(ctx, tokenAddress, app.address)) / Math.pow(10, TOKEN_DECIMALS[token])
        result.push({
          token,
          balance: balance * rates[tokenAddress],
          ...app
        })
        ctx.log.debug({
          app: app.address,
          token,
          balance: result[result.length - 1]
        }, 'Fetched balance for app')
      }

      return result
    }).then((balances) => balances.flat())

    // Fetch all activity for the current period
    ctx.log.info('Fetching all activity for current period...')
    const activity = await fetchActivity(ctx)

    // Calculate totals for each KPI
    const totalAntHeld = _.chain(balances)
      .filter({ token: 'ANT' })
      .sumBy('balance')
      .value() || 1
    const totalAum = _.chain(balances)
      .sumBy('balance')
      .value() || 1
    const totalActivity = activity.length || 1
    ctx.log.info({
      totalAntHeld,
      totalAum,
      totalActivity
    }, 'KPI totals calculated.')

    // Calculate KPIs for each organization just once
    const antHeldByOrganization = _.chain(balances)
      .filter({ token: 'ANT' })
      .groupBy('organization')
      .mapValues((balances) => _.sumBy(balances, 'balance'))
      .value()
    const aumByOrganization = _.chain(balances)
      .groupBy('organization')
      .mapValues((balances) => _.sumBy(balances, 'balance'))
      .value()
    const activityByOrganization = _.chain(activity)
      .groupBy(({ to }) => {
        const app = apps.find((app) => app.address === to)
        if (!app) return 'NO_ORGANIZATION'
        return app.organization
      })
      .mapValues((activity) => activity.length)
      .value()
    const orgAppCounts = _.chain(apps)
      .groupBy('organization')
      .mapValues((apps) => apps.length)
      .value()

    // Calculate normalized organization scores
    ctx.log.info('Calculating org scores...')
    const orgScores = orgs.reduce((scores, org) => {
      const antHeld = antHeldByOrganization[org.address]
      const aum = aumByOrganization[org.address]
      const orgActivity = activityByOrganization[org.address]

      scores[org.address] = (antHeld / totalAntHeld) * 0.25 + (aum / totalAum) * 0.25 + (orgActivity / totalActivity) * 0.5
      ctx.log.debug({
        organization: org.address,
        antHeld,
        aum,
        activity: orgActivity.length,
        score: scores[org.address]
      }, 'Calculated organization score.')

      return scores
    }, {})

    // Calculate app scores
    ctx.log.info('Calculating app scores...')
    const appScores = apps.reduce((scores, app) => {
      if (!scores[app.appId]) {
        scores[app.appId] = 0
      }

      scores[app.appId] += orgScores[app.organization] / orgAppCounts[app.organization]
      ctx.log.debug({
        appId: app.appId,
        organization: app.organization,
        orgAppCounts: orgAppCounts[app.organization],
        orgScore: orgScores[app.organization]
      }, 'Increased app score.')

      return scores
    }, {})

    // Persist app scores in database
    const appBulk = ctx.db.collection('apps').initializeUnorderedBulkOp()
    for (const appId in appScores) {
      const score = appScores[appId]

      appBulk.find({
        hash: appId
      }).updateOne({
        $set: {
          score
        }
      })
    }
    await appBulk.execute()
    ctx.log.info('Updated app scores')

    // Persist organization scores and other organization metrics in database
    const orgBulk = ctx.db.collection('orgs').initializeUnorderedBulkOp()
    for (const orgAddress in orgScores) {
      const score = orgScores[orgAddress]
      const aum = aumByOrganization[orgAddress]
      const ant = antHeldByOrganization[orgAddress]
      const activity = activityByOrganization[orgAddress]

      orgBulk.find({
        address: orgAddress
      }).updateOne({
        $set: {
          score,
          aum,
          ant,
          activity
        }
      })
    }
    await orgBulk.execute()

    ctx.log.info('Updated org scores')
  }
}
