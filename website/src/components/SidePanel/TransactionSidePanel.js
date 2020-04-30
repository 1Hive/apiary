import React, { useState, useCallback, useEffect } from 'react'
import { useWallet } from 'use-wallet'
import Web3 from 'web3'
import {
  Button,
  IdentityBadge,
  Info,
  RadioList,
  SidePanel,
  textStyle,
  useToast,
  GU
} from '@aragon/ui'
import { constructPathDescription } from '../../utils/utils'

export default function TransactionSidePanel ({
  opened,
  onClose,
  proxies,
  transactionPath
}) {
  const [buttonDisabled, setButtonDisabled] = useState(false)
  const { connected, ethereum } = useWallet()
  const toast = useToast()

  const handleSubmit = useCallback(() => {
    if (!connected) {
      return
    }
    setButtonDisabled(true)
    const web3 = new Web3(ethereum)
    // We're not awaiting the transaction as we don't want to wait
    // for the tx hash, but only the user's signoff.
    web3.eth.sendTransaction(transactionPath[0], (err, _) => {
      if (err) {
        console.error(err)
        onClose()
        toast('There was a problem while sending your transaction.')
        return
      }
      onClose()
      toast('Transaction sent successfully!')
    })
  }, [transactionPath, ethereum, connected])

  if (!transactionPath || !transactionPath.length) {
    return null
  }

  const radioItems = constructPathDescription(transactionPath, proxies)
  const { annotatedDescription, to } = transactionPath[transactionPath.length - 1]

  return (
    <SidePanel
      title='Create transaction'
      opened={opened}
      onClose={onClose}
    >
      <div
        css={`
          margin-top: ${2 * GU}px;
          width: 100%;
        `}
      >
        <Info mode='warning' title='Permission note'>
          You cannot directly perform this action. You do not have the
          necessary permissions.
        </Info>
        <RadioList
          title='Action Requirement'
          description='You can perform this action through:'
          items={radioItems}
          selected={0}
          css={`
            margin-top: ${2 * GU}px;
          `}
        />
        <Info
          mode='description'
          title='Action to be triggered'
          css={`
            margin-top: ${2 * GU}px;
          `}
        >
          <>
            <p>This transaction will eventually perform</p>
            <div
              css={`
                margin: ${0.5 * GU}px 0 ${0.5 * GU}px ${1 * GU}px;
                line-height: 1.6;
              `}
            >
              {annotatedDescription
                ? annotatedDescription.map(({ type, value }, index) => {
                  if (type === 'address' || type === 'any-account') {
                    return (
                      <span
                        key={index}
                        css={`
                          display: inline-flex;
                          vertical-align: middle;
                          margin-right: 4px;
                          position: relative;
                          top: -1px;
                        `}
                      >
                        <IdentityBadge
                          entity={type === 'any-account' ? 'Any account' : value}
                          labelStyle={`
                            ${textStyle('body3')}
                          `}
                          compact
                        />
                      </span>
                    )
                  }
                  if (type === 'app') {
                    return (
                      <span
                        key={index}
                        css='margin-right: 2px'
                      >
                        {value.name}
                      </span>
                    )
                  }
                  if (type === 'role' || type === 'bytes32') {
                    return (
                      <span
                        key={index}
                        css={`
                          margin-right: 4px;
                          font-style: italic;
                        `}
                      >
                        {'Manage Profile'}
                      </span>
                    )
                  }
                  if (type === 'apmPackage') {
                    return (
                      <span
                        key={index}
                        css={`
                          display: inline-flex;
                          vertical-align: middle;
                          margin-right: 4px;
                        `}
                      >
                        <IdentityBadge
                          entity={value.name}
                          labelStyle={`
                            ${textStyle('body3')}
                          `}
                        />
                      </span>
                    )
                  }
                  return (
                    <span key={index} css='margin-right: 4px'>
                      {value}
                    </span>
                  )
                })
                : 'an action'}
            </div>
          </>
        </Info>
        <Button
          mode='strong'
          disabled={buttonDisabled}
          onClick={handleSubmit}
          wide
          css={`
            margin-top: ${2 * GU}px;
          `}
        >
         Create transaction
        </Button>
      </div>
    </SidePanel>
  )
}
