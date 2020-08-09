import React, { useCallback } from 'react'
import PropTypes from 'prop-types'
import { IconArrowUp, useToast, textStyle, useTheme } from '@aragon/ui'
import { useQuery, useMutation } from 'graphql-hooks'
import { useWallet } from 'use-wallet'
import Web3 from 'web3'
import { composeMessage } from '../../utils/utils'

const UPVOTES_QUERY = `
  query(
    $address: ID!
  ) {
    organization(
      id: $address
    ) {
      upvotes
    }
  }
`

const UPVOTE_MUTATION = `
  mutation(
    $address: String!,
    $signerAddress: String!,
    $signedMessage: String!
  ) {
    upvoteOrganization(
      address: $address,
      signerAddress: $signerAddress,
      signedMessage: $signedMessage,
    ) {
      upvotes
    }
  }
`

export const UPVOTE_PREFIX = 'UPVOTE_DATA'
export default function Vote ({
  address
}) {
  const theme = useTheme()
  const toast = useToast()
  const { connected, account, ethereum } = useWallet()
  const [upvoteMutation] = useMutation(UPVOTE_MUTATION)

  const {
    loading,
    data,
    refetch
  } = useQuery(UPVOTES_QUERY, {
    variables: {
      address
    }
  })

  const upvote = useCallback(async () => {
    if (!connected) {
      toast('Connect your account to vote on organizations.')
      return
    }

    const web3 = new Web3(ethereum)
    const messageToSign = composeMessage(UPVOTE_PREFIX, {
      address
    })

    const signedMessage = await web3.eth.personal.sign(messageToSign, account)
    const { error } = await upvoteMutation({
      variables: {
        address,
        signerAddress: account,
        signedMessage
      }
    })

    if (error) {
      toast('There was an error processing your upvote.')
    } else {
      refetch()
    }
  })

  return (
    <div>
      <IconArrowUp onClick={upvote} css={`color: ${theme.positive}; vertical-align: bottom`} />
      <span css={`${textStyle('label2')}`}>{loading ? '-' : data.organization.upvotes}</span>
    </div>
  )
}

Vote.propTypes = {
  address: PropTypes.string.isRequired
}
