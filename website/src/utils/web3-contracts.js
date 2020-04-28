import React, { useState, useEffect } from 'react'
import { useWallet } from 'use-wallet'
import Aragon from '@aragon/wrapper'
import Web3 from 'web3'

const APM_CONFIG = {
  ensRegistryAddress:
    '0x98df287b6c145399aaa709692c8d308357bc085d',
  ipfs: {
    gateway: 'https://ipfs.eth.aragon.network/ipfs'
  }
}

export function useWrapper ({ daoAddress }) {
  const [aragonWrapper, setAragonWrapper] = useState(null)
  const [aragonWrapperReady, setAragonWrapperReady] = useState(false)
  const { connected, account, ethereum } = useWallet()
  useEffect(() => {
    async function initAragonJs () {
      if (!connected) {
        setAragonWrapperReady(false)
        return
      }

      const web3 = new Web3(window.ethereum)
      const wrapper = new Aragon(
        daoAddress,
        {
          provider: web3.currentProvider,
          apm: APM_CONFIG
        }
      )

      await wrapper.init({
        accounts: {
          providedAccounts: connected ? [account] : []
        }
      })

      const aclAddress = await wrapper.kernelProxy.contract.methods.acl().call()
      await wrapper.initAcl({
        aclAddress
      })

      setAragonWrapper(wrapper)
      setAragonWrapperReady(true)
    }
    initAragonJs()
  }, [connected, account, ethereum])

  return [aragonWrapper, aragonWrapperReady]
}
