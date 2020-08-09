import DataLoader from 'dataloader'

export function buildProfileLoader (db) {
  return new DataLoader(async (keys) => {
    const results = await db
      .find({
        address: {
          $in: keys
        }
      })
      .toArray()

    // We have to reorder the results and insert nulls in case
    // the profile does not exist as this is expected by DataLoader.
    const profiles = []
    for (const result of results) {
      profiles[keys.indexOf(result.address)] = result
    }
    for (let i = 0; i < keys.length; i++) {
      if (!profiles[i]) profiles[i] = null
    }
    return profiles
  })
}

export function buildOrgLoader (db) {
  return new DataLoader(async (keys) => {
    const results = await db
      .find({
        address: {
          $in: keys
        }
      })
      .toArray()

    // We have to reorder the results and insert nulls in case
    // the profile does not exist as this is expected by DataLoader.
    const orgs = []
    for (const result of results) {
      orgs[keys.indexOf(result.address)] = result
    }
    for (let i = 0; i < keys.length; i++) {
      if (!orgs[i]) orgs[i] = null
    }
    return orgs
  })
}
