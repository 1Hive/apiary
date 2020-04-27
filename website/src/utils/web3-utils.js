import CryptoJS from 'crypto-js'
import sha3lib from 'crypto-js/sha3'

export function getNetworkType (chainId = process.env.CHAIN_ID) {
  chainId = String(chainId)

  if (chainId === '1') return 'main'
  if (chainId === '3') return 'ropsten'

  // Return rinkeby as default
  return '4'
}

export function getUseWalletProviders () {
  const providers = [{ id: 'injected' }, { id: 'frame' }]

  return providers
}

/**
 * Shorten an Ethereum address. `charsLength` allows to change the number of
 * characters on both sides of the ellipsis.
 *
 * Examples:
 *   shortenAddress('0x19731977931271')    // 0x1973…1271
 *   shortenAddress('0x19731977931271', 2) // 0x19…71
 *   shortenAddress('0x197319')            // 0x197319 (already short enough)
 *
 * @param {string} address The address to shorten
 * @param {number} [charsLength=4] The number of characters to change on both sides of the ellipsis
 * @returns {string} The shortened address
 */
export function shortenAddress (address, charsLength = 4) {
  const prefixLength = 2 // "0x"
  if (!address) {
    return ''
  }
  if (address.length < charsLength * 2 + prefixLength) {
    return address
  }
  return (
    address.slice(0, charsLength + prefixLength) +
    '…' +
    address.slice(-charsLength)
  )
}

/*
 * Implementation from web3.js (https://github.com/ethereum/web3.js/blob/master/lib/utils/utils.js)
 */

export function isAddress (address) {
  if (!/^(0x)?[0-9a-f]{40}$/i.test(address)) {
    // check if it has the basic requirements of an address
    return false
  } else if (
    /^(0x)?[0-9a-f]{40}$/.test(address) ||
    /^(0x)?[0-9A-F]{40}$/.test(address)
  ) {
    // If it's all small caps or all all caps, return true
    return true
  } else {
    // Otherwise check each case
    return isChecksumAddress(address)
  }
}

function isChecksumAddress (address) {
  // Check each case
  address = address.replace('0x', '')
  var addressHash = sha3(address.toLowerCase())

  for (var i = 0; i < 40; i++) {
    // the nth letter should be uppercase if the nth digit of casemap is 1
    if (
      (parseInt(addressHash[i], 16) > 7 &&
        address[i].toUpperCase() !== address[i]) ||
      (parseInt(addressHash[i], 16) <= 7 &&
        address[i].toLowerCase() !== address[i])
    ) {
      return false
    }
  }
  return true
}

function sha3 (value, options) {
  if (options && options.encoding === 'hex') {
    if (value.length > 2 && value.substr(0, 2) === '0x') {
      value = value.substr(2)
    }
    value = CryptoJS.enc.Hex.parse(value)
  }

  return sha3lib(value, {
    outputLength: 256
  }).toString()
}
