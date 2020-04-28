import React, { useCallback } from 'react'
import { useWallet } from 'use-wallet'
import Aragon from '@aragon/wrapper'

export default function SidePanel ({
  daoAddress,
  manageRole,
  onClose,
  onOpen,
  organisation,
  selectedSidePanel,
  web3
}) {
  const { account } = useWallet()

  const handleInitWrapper = useCallback(async () => {
    const wrapper = new Aragon(
      daoAddress,
      {
        provider: web3.currentProvider,
        apm: {
          ensRegistryAddress:
            // TODO: change to mainnet ens registry address
            '0x98df287b6c145399aaa709692c8d308357bc085d',
          ipfs: {
            gateway: 'https://ipfs.eth.aragon.network/ipfs'
          }
        }
      }
    )
    await wrapper.init({
      accounts: {
        providedAccounts: [account]
      }
    })
    return wrapper
  }, [])

  const handleClaimDao = useCallback(async () => {
    const votingAddress = organisation.proxies.find(appProxy => appProxy.app && appProxy.app.name === 'Voting')

    const txPath = await wrapper.getACLTransactionPath(
      'createPermission',
      [
        account,
        daoAddress,
        manageRole,
        votingAddress.address
      ]
    )
    web3.eth.sendTransaction(txPath[0])
    console.log(txPath)
  }, [])

  return
}
