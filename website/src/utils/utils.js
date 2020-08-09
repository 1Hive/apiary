import React from 'react'
import { isAddress } from './web3-utils'

export function isProfileEmpty ({ name, description, icon, links }) {
  return !name && !description && !icon && !links.length
}

export function composeMessage (prefix, obj) {
  return `${prefix}${JSON.stringify(obj, Object.keys(obj).sort())}`
}

export function constructPathDescription (transactionPath, apps) {
  const preTransactionPath = transactionPath.slice(0, transactionPath.length - 1)
  const transactionDescription = preTransactionPath.map(({ description, to }, index) => {
    // See if we can find the app address on the proxies
    const appProxy = apps.find(({ address }) => address === to)
    const appName = appProxy && appProxy.app && appProxy.app.name
    // Compose the full description, in this form
    // 1. APP_NAME: DESCRIPTION
    const fullDescription =
      <p key={index}>
        {`${index + 1}.${`${!appName ? ' ' : ` ${appName}:`}`} ${description}`}
      </p>
    return fullDescription
  })

  const formattedDescription = <>{transactionDescription}</>
  return [{
    title: 'Transaction Path',
    description: formattedDescription
  }]
}

export function getDaoFromLocation (location) {
  const locationParams = new URLSearchParams(location.search)
  const daoAddress = locationParams.get('dao')
  if (!isAddress(daoAddress)) {
    return null
  }
  return daoAddress
}
