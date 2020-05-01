import ethUtil from 'ethereumjs-util'
import sigUtil from 'eth-sig-util'

/**
 * Check address equality without checksums
 * @param {string} first First address
 * @param {string} second Second address
 * @returns {boolean} Address equality
 */
export function addressesEqual (first, second) {
  first = first && first.toLowerCase()
  second = second && second.toLowerCase()
  return first === second
}

export function validateSignerAddress (originalMessage, signedMessage, signerAddress) {
  const encodedMessage = ethUtil.bufferToHex(Buffer.from(originalMessage, 'utf8'))
  const recoveredAddress = sigUtil.recoverPersonalSignature({ data: encodedMessage, sig: signedMessage })

  return addressesEqual(recoveredAddress, signerAddress)
}
