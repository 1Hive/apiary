const PROFILE_PREFIX = 'PROFILE_DATA'

export function camelToSnakeCase (string) {
  return string.replace(/[\w]([A-Z])/g, (m) =>
    `${m[0]}_${m[1]}`
  ).toLowerCase()
}

export function camelToSnakeCaseKeys (obj = {}) {
  return Object.keys(obj).reduce((o, key) => {
    o[camelToSnakeCase(key)] = obj[key]

    return o
  }, {})
}

/**
 * Re-create the original message composed in the frontend for signing
 * @param {string} daoAddress DAO address
 * @param {object} profile Organisation Profile
 * @returns {string} Original messaged that was then signed by the user.
 */
export function composeSignedMessage (daoAddress, { name, description, links, icon }) {
  const concatenatedLinks = links.reduce((concatenatedLinks, link) => `${concatenatedLinks}${link}`, '')

  return `${PROFILE_PREFIX}${daoAddress}${name.replace(/\s/g, '')}${description.replace(/\s/g, '')}${icon}${concatenatedLinks}`
}
