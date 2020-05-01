/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react'
import { useWallet } from 'use-wallet'
import Aragon from '@aragon/wrapper'
import Web3 from 'web3'

const MAINNET_ENS_REGISTRY = '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e'
const RINKEBY_ENS_REGISTRY = '0x98df287b6c145399aaa709692c8d308357bc085d'
const IPFS_GATEWAY = process.env.IPFS_GATEWAY || 'https://ipfs.eth.aragon.network/ipfs'

const chainId = process.env.CHAIN_ID || '1'

const APM_CONFIG = {
  ensRegistryAddress:
  chainId === '1' ? MAINNET_ENS_REGISTRY : RINKEBY_ENS_REGISTRY,
  ipfs: {
    gateway: IPFS_GATEWAY
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

      const web3 = new Web3(ethereum)
      const wrapper = new Aragon(
        daoAddress,
        {
          provider: web3.currentProvider,
          apm: APM_CONFIG
        }
      )

      await wrapper.init({
        accounts: {
          providedAccounts: [account]
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
