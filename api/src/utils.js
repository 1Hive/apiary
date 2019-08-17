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
