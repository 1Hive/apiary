import React, { useCallback, useEffect, useMemo, useState } from 'react'
import PropTypes from 'prop-types'
import { useQuery } from 'graphql-hooks'
import { useWallet } from 'use-wallet'
import {
  BackButton,
  Bar,
  Box,
  Text,
  Button,
  EmptyStateCard,
  Header,
  IdentityBadge,
  Split,
  textStyle,
  Info,
  useTheme,
  useToast,
  useViewport,
  GU
} from '@aragon/ui'
import AnimatedLogo from '../components/AnimatedLogo/AnimatedLogo'
import SmartLink from '../components/SmartLink/SmartLink'
import EditSidePanel from '../components/SidePanel/EditSidePanel'
import RejectionSidePanel from '../components/SidePanel/RejectionSidePanel'
import TransactionSidePanel from '../components/SidePanel/TransactionSidePanel'
import { formatNumber } from '../utils/numbers'
import {
  CLAIM_PROFILE,
  EDIT_PROFILE,
  NOT_CONNECTED_PROFILE,
  LOADING_PROFILE,
  REQUEST_EDIT_PROFILE,
  OWNERSHIP_STATUSES
} from '../utils/ownership-statuses'
import { getDaoFromLocation } from '../utils/utils'
import { useWrapper } from '../utils/web3-contracts'
import { addressesEqual } from '../utils/web3-utils'

const MANAGE_PROFILE_ROLE = '0x675b358b95ae7561136697fcc3302da54a334ac7c199d53621288290fb863f5c'
const EMPTY_SCRIPT = '0x00'
const NO_PERMISSION = '0x0000000000000000000000000000000000000000'

const REJECTION_PANEL_TIME = 4000

const ORGANIZATION_QUERY = `
  query(
    $address: ID!
  ) {
    organization(
      id: $address
    ) {
      address
      createdAt
      profile {
        name
        description
        icon
        links
        editors
      }
      apps {
        repoName
        address
        version {
          semanticVersion
          manifest
        }
      }
    }
  }
`

function Profile ({ history, location }) {
  const daoAddress = getDaoFromLocation(location)

  if (!daoAddress) {
    return <ProfileNotFound history={history} />
  }

  return <DaoProfile daoAddress={daoAddress} history={history} />
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

function DaoProfile ({ daoAddress, history }) {
  const [editPanelOpened, setEditPanelOpened] = useState(false)
  const [rejectionPanelOpened, setRejectionPanelOpened] = useState(false)
  const [transactionPanelOpened, setTransactionPanelOpened] = useState(false)
  const [transactionPath, setTransactionPath] = useState(null)
  const [ownershipStatus, setOwnershipStatus] = useState('NOT_CONNECTED_PROFILE')

  const [wrapper, wrapperReady] = useWrapper({ daoAddress })
  const { connected, account } = useWallet()
  const theme = useTheme()
  const { below } = useViewport()
  const toast = useToast()

  const {
    loading,
    error,
    data,
    refetch
  } = useQuery(ORGANIZATION_QUERY, {
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
      if (!connected) {
        setOwnershipStatus(NOT_CONNECTED_PROFILE)
        return
      }
      setOwnershipStatus(LOADING_PROFILE)
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
      // Diffing:
      // If the permission has not been created,
      // The person can request to create it and
      // set himself as an editor
      if (addressesEqual(permissionCreated, NO_PERMISSION)) {
        setOwnershipStatus(CLAIM_PROFILE)
      }
      // If the permission has been created but the
      // person is not an editor, then he can request edit rights
      if (!addressesEqual(permissionCreated, NO_PERMISSION) && !isEditor) {
        setOwnershipStatus(REQUEST_EDIT_PROFILE)
      }
      // Else, he can edit his profile
      if (!addressesEqual(permissionCreated, NO_PERMISSION) && isEditor) {
        setOwnershipStatus(EDIT_PROFILE)
      }
    }
    checkOwnershipStatus()
  }, [connected, wrapper, wrapperReady])

  const openEditPanel = useCallback(() => setEditPanelOpened(true), [])
  const closeEditPanel = useCallback(() => setEditPanelOpened(false), [])

  const openRejectionPanel = useCallback(() => {
    setRejectionPanelOpened(true)
    setTimeout(() => setRejectionPanelOpened(false), REJECTION_PANEL_TIME)
  }, [])
  const closeRejectionPanel = useCallback(() => {
    setRejectionPanelOpened(false)
  }, [])

  const openTransactionPanel = useCallback(transactionPath => {
    setTransactionPath(transactionPath)
    setTransactionPanelOpened(true)
  }, [])
  const closeTransactionPanel = useCallback(() => {
    setTransactionPanelOpened(false)
  }, [])

  const handleOwnershipIntent = useCallback(async () => {
    if (ownershipStatus === 'NOT_CONNECTED_PROFILE') {
      toast('To claim this profile, you must connect to web3.')
      return
    }

    const { organization } = data

    if (ownershipStatus === 'CLAIM_PROFILE') {
      // handle open claim profile panel
      const votingAddress = organization.apps.find(
        appProxy => appProxy.repoName === 'voting'
      )
      if (!votingAddress) {
        console.error(`Could not find voting app.`)
        console.error(organization.apps)
        openRejectionPanel()
        setTransactionPath(null)
        return
      }

      const transactionPath = await wrapper.getACLTransactionPath(
        'createPermission',
        [
          account,
          daoAddress,
          MANAGE_PROFILE_ROLE,
          votingAddress.address
        ]
      )
      // There's no possible path.
      // Also, block Dandelion apps from claiming their profile,
      // due to not supporting pre-transactions as of yet. :(
      if (!transactionPath.length) {
        openRejectionPanel()
        setTransactionPath(null)
        return
      }
      openTransactionPanel(transactionPath)
    }

    if (ownershipStatus === 'REQUEST_EDIT_PROFILE') {
      // handle open request edit profile
      const transactionPath = await wrapper.getACLTransactionPath(
        'grantPermission',
        [
          account,
          daoAddress,
          MANAGE_PROFILE_ROLE
        ]
      )
      //
      // There's no possible path.
      if (!transactionPath.length) {
        openRejectionPanel()
        setTransactionPath(null)
        return
      }
      openTransactionPanel(transactionPath)
    }

    if (ownershipStatus === 'EDIT_PROFILE') {
      openEditPanel()
    }
  }, [data, ownershipStatus, transactionPath])

  const ownershipActionLabel = useMemo(() => OWNERSHIP_STATUSES.get(ownershipStatus), [ownershipStatus])

  if (error) {
    return <Info mode='error'>An error occurred. Try again.</Info>
  }

  if (loading || ownershipStatus === 'LOADING_PROFILE') {
    return (
      <div
        css={`
          width: 100%;
        `}
      >
        <Header
          primary='Profile'
        />
        <div
          css={`
            width: 100%;
            display: flex;
            align-items: flex-end;
            justify-content: center;
          `}
        >
          <AnimatedLogo mode='half-circle' />
        </div>
      </div>
    )
  }

  const { organization } = data

  return (
    <div>
      <EditSidePanel
        address={daoAddress}
        description={organization.profile.description}
        name={organization.profile.name}
        icon={organization.profile.icon}
        links={organization.profile.links}
        opened={editPanelOpened}
        onClose={closeEditPanel}
        refetchQuery={refetch}
      />
      <TransactionSidePanel
        onClose={closeTransactionPanel}
        opened={transactionPanelOpened}
        apps={organization.apps}
        transactionPath={transactionPath}
      />
      <RejectionSidePanel
        onClose={closeRejectionPanel}
        opened={rejectionPanelOpened}
      />
      <Header
        primary='Profile'
        secondary={
          <Button
            disabled={!connected || !wrapperReady}
            mode='strong'
            label='Edit Profile'
            onClick={handleOwnershipIntent}
          >
            {ownershipActionLabel}
          </Button>
        }
      />
      <Bar primary={<BackButton onClick={() => {
        if (history.length) {
          history.goBack()
        } else {
          window.location.href = '/'
        }
      }} />} />
      <Box>
        <div
          css={`
            display: flex;
          `}
        >
          {organization.profile.icon && <img src={organization.profile.icon} height='80px' width='auto' />}
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
              {organization.profile.name || 'No name available.'}
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
                padding-right: ${1 * GU}
              `}
            >
              {organization.profile.description || 'No description available.'}
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
              {organization.profile.editors.length
                ? organization.profile.editors.map(editor => (
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
                ) : 'No authorized editors have claimed this profile.'}
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
            {organization.profile.links.length
              ? organization.profile.links
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
        {ownershipStatus === 'NOT_CONNECTED_PROFILE' && (
          <Info title='Editing Profile' css={`margin-top: ${GU}px`}>
            {organization.profile.editors.length === 0 && 'This profile has not been claimed and is open for editing.'}
            To edit or claim this profile, please connect your wallet.
          </Info>
        )}
      </Box>
    </div>
  )
}

DaoProfile.propTypes = {
  daoAddress: PropTypes.string,
  history: PropTypes.object
}

export default Profile
