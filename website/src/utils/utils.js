import React from 'react'
import { isAddress } from './web3-utils'
const PROFILE_PREFIX = 'PROFILE_DATA'

export function composeMessage (address, name, description, icon, links) {
  const concatenatedLinks = links.reduce((concatenatedLinks, link) => `${concatenatedLinks}${link}`, '')
  return `${PROFILE_PREFIX}${address}${name.replace(/\s/g, '')}${description.replace(/\s/g, '')}${icon}${concatenatedLinks}`
}

export function constructPathDescription (transactionPath, proxies) {
  const preTransactionPath = transactionPath.slice(0, transactionPath.length - 1)
  const transactionDescription = preTransactionPath.map(({ description, to }, index) => {
    // See if we can find the app address on the proxies
    const appProxy = proxies.find(({ address }) => address === to)
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
  return [
    {
      title: 'Transaction Path',
      description: formattedDescription
    }
  ]
}

export function getDaoFromLocation (location) {
  const locationParams = new URLSearchParams(location.search)
  const daoAddress = locationParams.get('dao')
  if (!isAddress(daoAddress)) {
    return null
  }
  return daoAddress
}
