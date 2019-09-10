export function appInstalls (ctx) {
  return async function appInstallsMetric () {
    const apps = ctx.db.collection('apps')

    // For now we're first running an aggregate to count
    // the number of installations for an app, and then
    // we're adding the field to each app individually
    // in other queries.
    //
    // This can be simplified when we're running MongoDB 4.6,
    // see: https://docs.mongodb.com/manual/reference/operator/aggregation/merge/
    const installsPerApp = apps.aggregate([{
      $lookup: {
        from: 'orgs',
        localField: 'hash',
        foreignField: 'apps.id',
        as: 'installations'
      }
    }, {
      $addFields: {
        installations: {
          $size: '$installations'
        }
      }
    }])

    for await (let appInstalls of installsPerApp) {
      await apps.updateOne({
        _id: appInstalls._id
      }, {
        $set: {
          installations: appInstalls.installations
        }
      })
    }

    ctx.log.info('Updated app installations metric')
  }
}
