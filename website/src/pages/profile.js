import React, { useState, useCallback, useEffect } from 'react'
import PropTypes from 'prop-types'
import { useQuery } from 'graphql-hooks'
import { useWallet } from 'use-wallet'
import {
  BackButton,
  Bar,
  Box,
  Button,
  EmptyStateCard,
  Header,
  IdentityBadge,
  LoadingRing,
  Split,
  textStyle,
  Info,
  useTheme,
  useViewport,
  GU
} from '@aragon/ui'
import SmartLink from '../components/SmartLink'
import EditSidePanel from '../components/SidePanel/EditSidePanel'
import { formatNumber } from '../utils/numbers'
import { isProfileEmpty } from '../utils/utils'
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
        editors
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
  const daoAddress = useDaoFromLocation(location)

  if (!daoAddress) {
    return <ProfileNotFound history={history} />
  }
  console.log('dao address:', daoAddress)
  return <DaoProfile daoAddress={daoAddress} />
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

function DaoProfile ({ daoAddress }) {
  const [editPanelOpened, setEditPanelOpened] = useState(false)
  const [editButtonDisabled, setEditButtonDisabled] = useState(false)
  const [editPanelData, setEditPanelData] = useState(null)
  const [ownershipStatus, setOwnershipStatus] = useState('NOT_CONNECTED_PROFILE')
  const [sidePanel, setSidePanel] = useState('')
  const [wrapper, wrapperReady] = useWrapper({ daoAddress })
  const { connected, account, ethereum } = useWallet()
  const theme = useTheme()
  const { below } = useViewport()

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

  const profileEmpty = isProfileEmpty(organisation.profile)

  if (
    profileEmpty &&
    (ownershipStatus === 'CLAIM_PROFILE' || ownershipStatus === 'NOT_CONNECTED_PROFILE')
  ) {
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
          text='This DAO does not have a profile. Claim it to edit it!'
          action={<Button onClick={() => history.push('/')}>See all DAOs</Button>}
        />
      </div>
    )
  }
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
      <Header
        primary='Profile'
        secondary={
          <Button
            mode='strong'
            label='Edit Profile'
            onClick={() => undefined}
          >
            Edit Profile
          </Button>
        }
      />
      <Split
        primary={
          <>
            <Bar primary={<BackButton onClick={() => history.back()} />} />
            <Box>
              <div
                css={`
                  display: flex;
                `}
              >
                {organisation.profile.icon && <img src={organisation.profile.icon} height='80px' width='auto' />}
                <div
                  css={`
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                    margin-left: ${2 * GU}px;
                  `}
                >

                  <div
                    css={`
                      ${textStyle('title3')}
                    `}
                  >
                    {organisation.profile.name || 'No name available.'}
                  </div>

                  <IdentityBadge entity={daoAddress} />

                </div>
              </div>
              <div
                css={`
                  display: grid;
                  grid-template-columns: 1fr 1fr;
                  ${below('medium') && `
                    display: flex;
                    flex-direction: column;
                  `}
                `}
              >
                <div>
                  <div
                    css={`
                      margin-top: ${2 * GU}px;
                      margin-bottom: ${1 * GU}px;
                      ${textStyle('label2')}
                      color: ${theme.contentSecondary};
                    `}
                  >
                  Description
                  </div>
                  <p
                    css={`
                      margin-bottom: ${2 * GU}px;
                    `}
                  >
                    {organisation.profile.description || 'No description available.'}
                  </p>
                </div>
                <div>
                  <div
                    css={`
                      margin-top: ${2 * GU}px;
                      margin-bottom: ${1 * GU}px;
                      ${textStyle('label2')}
                      color: ${theme.contentSecondary};
                    `}
                  >
                  Editors
                  </div>
                  <div>
                    {organisation.profile.editors.length
                      ? organisation.profile.editors.map(editor => (
                        <div
                          key={editor}
                          css={`
                            margin-top: ${1 * GU}px;
                          `}
                        >
                          <IdentityBadge
                            entity={editor}
                          />
                        </div>
                      )
                      ) : 'No authorized editors have edited this profile.'}
                  </div>
                </div>
                <div
                  css={`
                    grid-column: 2 / span 1;
                  `}
                >
                  <div
                    css={`
                      margin-top: ${2 * GU}px;
                      margin-bottom: ${1 * GU}px;
                      ${textStyle('label2')}
                      color: ${theme.contentSecondary};
                    `}
                  >
                  Links
                  </div>
                  {organisation.profile.links.length
                    ? organisation.profile.links
                      .map(link => (
                        <div
                          key={link}
                          css={`
                            display: flex;
                            flex-wrap: wrap;
                            margin-right: ${1 * GU}px;
                          `}
                        >
                          <SmartLink url={link} />
                        </div>
                      )
                      ) : 'No links available.'}
                </div>
              </div>
              {ownershipStatus === 'NOT_CONNECTED_PROFILE' ? (
                <Info title='Editing Profile'>
                  To edit, claim or add yourself as an editor for this DAO profile, please connect to web3.
                </Info>
              ) : ownershipStatus === 'LOADING_PROFILE' ? (<p><LoadingRing /></p>) : (
                <p>
                  <Button onClick={handleOwnershipIntent}>{OWNERSHIP_STATUSES.get(ownershipStatus)}</Button>
                </p>
              )}
            </Box>
          </>
        }
        secondary={
          <Box>
            <h3>Stats</h3>
            <div
              css={`
                display: flex;
                flex-direction: column;
              `}
            >
              <div
                css={`
                  margin-top: ${2 * GU}px;
                  margin-bottom: ${1 * GU}px;
                  ${textStyle('label2')}
                  color: ${theme.contentSecondary};
                `}
              >
              AUM ◈
              </div>
              <div
                css={`
                  ${textStyle('body3')}
                `}
              >
                {formatNumber(organisation.aum)}
              </div>
            </div>
            <div
              css={`
                margin-top: ${2 * GU}px;
                margin-bottom: ${1 * GU}px;
                ${textStyle('label2')}
                color: ${theme.contentSecondary};
              `}
            >
            Activity
            </div>
            <div
              css={`
                ${textStyle('body3')}
              `}
            >
              {formatNumber(organisation.activity)}
            </div>
          </Box>
        }
      />
    </div>
  )
}

DaoProfile.propTypes = {
  daoAddress: PropTypes.string
}

export default Profile
