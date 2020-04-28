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

export function composeSignedMessage (daoAddress, { name, description, links, icon }) {
  const concatenatedLinks = links.reduce((concatenatedLinks, link) => `${concatenatedLinks}${link}`, '')

  return `${PROFILE_PREFIX}${daoAddress}${name.replace(/\s/g, '')}${description.replace(/\s/g, '')}${icon}${concatenatedLinks}`
}
