export function validateEnvironment (requiredEnvVars) {
  const missingEnvVars = requiredEnvVars.filter(
    (varName) => !process.env[varName]
  )
  for (const missingVar of missingEnvVars) {
    console.error(`Please set ${missingVar}.`)
  }

  if (missingEnvVars.length > 0) {
    console.error('Misconfigured environment. Please see above.')
    process.exit(1)
  }
}

export function toNetworkAddress (address) {
  return `${process.env.NETWORK_ID}-${address.toLowerCase()}`
}

export function fromNetworkAddress (address) {
  return address.split('-')[1]
}
