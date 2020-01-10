const TOKEN_ADRESSES = {
  [Symbol('ETH')]: '0x0000000000000000000000000000000000000000',
  [Symbol('ANT')]: '0x960b236A07cf122663c4303350609A66A7B288C0',
  [Symbol('DAI')]: '0x6b175474e89094c44da98b954eedeac495271d0f',
  [Symbol('USDC')]: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'
}

function fetchTokenBalance (
  ctx,
  tokenAddress,
  accountAddress
) {
  if (tokenAddress === TOKEN_ADRESSES[Symbol('ETH')]) {
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

function fetchActivity (ctx) {
  return ctx.db.collection('activity').aggregate([{
    $unwind: '$actions'
  }, {
    $project: {
      timestamp: '$timestamp',
      to: '$actions.to'
    }
  }]).toArray()
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

    // Fetch balances for all installed apps
    ctx.log.info('Fetching all balances...')
    const balances = Promise.all(apps.map(async (app) => {
      const result = []
      for (const [token, tokenAddress] of TOKEN_ADRESSES.entries()) {
        ctx.log.info({
          app: app.address,
          token: tokenAddress
        }, 'Fetching balance for app')
        result.push({
          token,
          balance: await fetchTokenBalance(ctx, tokenAddress, app.address),
          ...app
        })
      }

      return result
    })).flat()

    // Fetch all activity for the current period
    ctx.log.info('Fetching all activity for current period...')
    const activity = await fetchActivity(ctx)

    // Calculate totals for each KPI
    const totalAntHeld = balances.filter(
      (balance) => balance.token === Symbol('ANT')
    ).reduce(0, (acc, { balance }) => {
      return acc + balance
    })
    const totalAum = balances.reduce(0, (acc, { balance }) => {
      return acc + balance
    })
    const totalActivity = activity.length
    ctx.log.info({
      totalAntHeld,
      totalAum,
      totalActivity
    }, 'KPI totals calculated.')

    // Calculate normalized organization scores
    ctx.log.info('Calculating org scores...')
    const orgScores = orgs.reduce({}, (scores, org) => {
      const antHeld = balances.filter(
        ({ token }) => token === Symbol('ANT')
      ).filter(
        ({ organization }) => organization === org.address
      ).reduce(0, (acc, { balance }) => {
        return acc + balance
      })
      const aum = balances.filter(
        ({ organization }) => organization === org.address
      ).reduce(0, (acc, { balance }) => {
        return acc + balance
      })
      const orgActivity = activity.filter(
        ({ organization }) => organization === org.address
      )

      scores[org.address] = (antHeld / totalAntHeld) * 0.25 + (aum / totalAum) * 0.25 + (orgActivity / totalActivity) * 0.5
      ctx.log.debug({
        organization: org.address,
        antHeld,
        aum,
        activity: orgActivity
      }, 'Calculated organization score.')

      return scores
    })

    // Calculate app scores
    ctx.log.info('Calculating app scores...')
    const orgAppCounts = apps.reduce({}, (appCounts, app) => {
      if (!appCounts[app.organization]) {
        appCounts[app.organization] = 0
      }

      appCounts[app.organization]++
      return appCounts
    })
    const appScores = apps.reduce({}, (scores, app) => {
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
    })

    // Persist app scores in database
    const bulk = ctx.db.collection('apps').initializeUnorderedBulkOp()
    for (const appId in appScores) {
      const score = appScores[appId]

      bulk.find({
        hash: appId
      }).updateOne({
        $set: {
          score
        }
      })
    }
    await bulk.execute()
    ctx.log.info('Updated app scores')
  }
}
