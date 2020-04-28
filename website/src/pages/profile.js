import React, { useState, useCallback, useEffect } from 'react'
import PropTypes from 'prop-types'
import { useQuery } from 'graphql-hooks'
import { useWallet } from 'use-wallet'
import { Box, Button, EmptyStateCard, LoadingRing, Split, textStyle, Info } from '@aragon/ui'
import SmartLink from '../components/SmartLink'
import EditSidePanel from '../components/SidePanel/EditSidePanel'
import { useWrapper } from '../utils/web3-contracts'
import { addressesEqual, isAddress } from '../utils/web3-utils'

const MANAGE_PROFILE_ROLE = '0x675b358b95ae7561136697fcc3302da54a334ac7c199d53621288290fb863f5c'
const EMPTY_SCRIPT = '0x00'
const NO_PERMISSION = '0x0000000000000000000000000000000000000000'

const OWNERSHIP_STATUSES = new Map([
  ['CLAIM_PROFILE', 'Claim profile'],
  ['REQUEST_EDIT_PROFILE', 'Request edit rights'],
  ['EDIT_PROFILE', 'Edit profile']
])

const ORGANISATION_QUERY = `
  query(
    $address: String!
  ) {
    organisation(
      address: $address
    ) {
      address
      ens
      createdAt
      aum
      activity
      score
      proxies {
        app {
          name
        }
        address
      }
      profile {
        name
        description
        icon
        links
      }
    }
  }
`

function useDaoFromLocation (location) {
  const locationParams = new URLSearchParams(location.search)
  const daoAddress = locationParams.get('dao')
  if (!isAddress(daoAddress)) {
    return null
  }
  return daoAddress
}

function Profile ({ history, location }) {
  const { connected } = useWallet()
  const daoAddress = useDaoFromLocation(location)

  if (!daoAddress) {
    return <ProfileNotFound history={history} />
  }
  console.log('dao address:', daoAddress)
  return <ConnectedProfile daoAddress={daoAddress} />
}

Profile.propTypes = {
  history: PropTypes.object,
  location: PropTypes.object
}

function ProfileNotFound ({ history }) {
  return (
    <div
      css={`
        width: 100%;
        min-height: 90vh;
        display: flex;
        align-items: center;
        justify-content: center;
      `}
    >
      <EmptyStateCard
        text='This DAO was not found in our database.'
        action={<Button onClick={() => history.push('/')}>See all DAOs</Button>}
      />
    </div>
  )
}

ProfileNotFound.propTypes = {
  history: PropTypes.object
}

function ConnectedProfile ({ daoAddress }) {
  const [editPanelOpened, setEditPanelOpened] = useState(false)
  const [editButtonDisabled, setEditButtonDisabled] = useState(false)
  const [editPanelData, setEditPanelData] = useState(null)
  const [ownershipStatus, setOwnershipStatus] = useState('NOT_CONNECTED_PROFILE')
  const [sidePanel, setSidePanel] = useState('')
  const [wrapper, wrapperReady] = useWrapper({ daoAddress })
  const { connected, account, ethereum } = useWallet()

  const {
    loading,
    error,
    data,
    refetch
  } = useQuery(ORGANISATION_QUERY, {
    variables: {
      address: daoAddress
    },

    // This is kind of ugly, but this identity function
    // is here to ensure that we still have data to display
    // while loading the next set of data.
    updateData: (_, data) => data
  })

  useEffect(() => {
    async function checkOwnershipStatus () {
      console.log('useWallet', connected, account, ethereum)
      if (!connected) {
        setOwnershipStatus('NOT_CONNECTED_PROFILE')
        return
      }
      setOwnershipStatus('LOADING_PROFILE')
      if (!wrapperReady) {
        return
      }
      const [permissionCreated, isEditor] = await Promise.all([
        wrapper.aclProxy.contract.methods.getPermissionManager(
          daoAddress,
          MANAGE_PROFILE_ROLE
        ).call(),
        wrapper.kernelProxy.contract.methods.hasPermission(
          account,
          daoAddress,
          MANAGE_PROFILE_ROLE,
          EMPTY_SCRIPT
        ).call()]
      )
      console.log('performed setup with ', permissionCreated, isEditor)
      // Diffing:
      // If the permission has not been created,
      // The person can request to create it and
      // set himself as an editor
      if (addressesEqual(permissionCreated, NO_PERMISSION)) {
        setOwnershipStatus('CLAIM_PROFILE')
      }
      // If the permission has been created but the
      // person is not an editor, then he can request edit rights
      if (!addressesEqual(permissionCreated, NO_PERMISSION) && !isEditor) {
        setOwnershipStatus('REQUEST_EDIT_PROFILE')
      }
      // Else, he can edit his profile
      if (!addressesEqual(permissionCreated, NO_PERMISSION) && isEditor) {
        setOwnershipStatus('EDIT_PROFILE')
      }
    }
    checkOwnershipStatus()
  }, [connected, wrapper, wrapperReady])

  const handleOwnershipIntent = useCallback(() => {
    if (ownershipStatus === 'CLAIM_PROFILE') {
      // handle open claim profile panel
    }
    if (ownershipStatus === 'REQUEST_EDIT_PROFILE') {
      // handle open request edit profile
    }
    if (ownershipStatus === 'EDIT_PROFILE') {
      // handle open edit profile
      console.log('yay')
      setEditPanelData(organisation)
      setEditPanelOpened(true)
    }
    console.log('boom')
  }, [ownershipStatus])

  if (error) {
    return <Info mode='error'>An error occurred. Try again.</Info>
  }

  if (loading) {
    return <LoadingRing mode='half-circle' />
  }

  const { organisation } = data

  return (
    <div>
      {editPanelData && (
        <EditSidePanel
          opened={editPanelOpened}
          onOpen={setEditPanelOpened}
          onSet={setEditPanelData}
          onButtonDisabled={setEditButtonDisabled}
          refetchQuery={refetch}
          panelData={organisation}
          buttonDisabled={editButtonDisabled}
        />
      )}
      <Split
        primary={
          <Box>
            <div css={`
              ${textStyle('title3')}
            `}
            >Name
            </div>
            <p>{organisation.profile.name || 'No name available.'}</p>
            <div css={`
              ${textStyle('title3')}
            `}
            >Description
            </div>
            <p>{organisation.profile.description || 'No description available.'}</p>
            <h3 css={`
              ${textStyle('title3')}
            `}
            >Links
            </h3>
            {organisation.profile.links.length ? organisation.profile.links.map(link => <SmartLink url={link} key={link} />) : 'No links available.'}
            {ownershipStatus === 'NOT_CONNECTED_PROFILE' ? (
              <Info title='Editing Profile'>
                To edit, claim or add yourself as an editor for this DAO profile, please connect to web3.
              </Info>
                ) : ownershipStatus === 'LOADING_PROFILE' ? (<p><LoadingRing/></p>): (
              <p>
                <Button onClick={handleOwnershipIntent}>{OWNERSHIP_STATUSES.get(ownershipStatus)}</Button>
              </p>
            )}
          </Box>
        }
        secondary={
          <Box>
            <h3>Stats</h3>
          </Box>
        }
      />
    </div>
  )
}

ConnectedProfile.propTypes = {
  daoAddress: PropTypes.string
}

export default Profile
