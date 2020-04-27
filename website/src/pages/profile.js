import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { useQuery } from 'graphql-hooks'
import { useWallet } from 'use-wallet'
import Web3 from 'web3'
import { Box, Button, Split, textStyle, Info } from '@aragon/ui'
import Aragon from '@aragon/wrapper'
import SmartLink from '../components/SmartLink'
import EditSidePanel from '../components/SidePanel/EditSidePanel'
import { isAddress } from '../utils/web3-utils'

const MANAGE_PROFILE_ROLE = '0x675b358b95ae7561136697fcc3302da54a334ac7c199d53621288290fb863f5c'
const EMPTY_SCRIPT = '0x00'
const NO_PERMISSION = '0x0000000000000000000000000000000000000000'

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

function Profile ({ location }) {
  const { connected } = useWallet()
  const daoAddress = useDaoFromLocation(location)

  if (!daoAddress) {
    return <Box>Profile not found!</Box>
  }
  console.log('dao address:', daoAddress)
  return connected ? <ConnectedProfile daoAddress={daoAddress} /> : (
    <Box>Please connect to web3 to view your profile.</Box>
  )
}

Profile.propTypes = {
  location: PropTypes.object
}

function ConnectedProfile ({ daoAddress }) {
  const [editPanelOpened, setEditPanelOpened] = useState(false)
  const [editButtonDisabled, setEditButtonDisabled] = useState(false)
  const [editPanelData, setEditPanelData] = useState(null)
  const [sidePanel, setSidePanel] = useState('')
  const { connected, account } = useWallet()
  console.log('connected address', daoAddress)
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

  const web3 = new Web3(window.ethereum)
  console.log(web3.currentProvider, 'currentProvider')
  const wrapper = new Aragon(
    daoAddress,
    {
      provider: web3.currentProvider,
      apm: {
        ensRegistryAddress:
          '0x98df287b6c145399aaa709692c8d308357bc085d',
        ipfs: {
          gateway: 'https://ipfs.eth.aragon.network/ipfs'
        }
      }
    }
  )

  useEffect(() => {
    async function initAragonJS () {
      setEditButtonDisabled(true)
      try {
        await wrapper.init({
          accounts: {
            providedAccounts: connected ? [account] : []
          }
        })
        const aclAddress = await wrapper.kernelProxy.contract.methods.acl().call()
        await wrapper.initAcl({
          aclAddress
        })
        console.log(wrapper)
        // check editor status
        const permissionCreated =
          await wrapper.aclProxy.contract.methods
            .getPermissionManager(
              daoAddress,
              MANAGE_PROFILE_ROLE
            ).call()
        const isEditor = await wrapper.kernelProxy.contract.methods.hasPermission(
          account,
          daoAddress,
          MANAGE_PROFILE_ROLE,
          EMPTY_SCRIPT
        ).call()
        console.log(permissionCreated, isEditor, 'vars')
        // Permission doesn't exist; we should show the claim dao sidepanel.
        if (permissionCreated === NO_PERMISSION && !isEditor) {
          setSidePanel('CLAIM_SIDEPANEL')
          return
        }
        // Permission exists, but you are not an editor.
        // We should request the permission, if you are a token owner.
        if (permissionCreated !== NO_PERMISSION && !isEditor) {
          setSidePanel('GRANT_SIDEPANEL')
          return
        }
        setSidePanel('EDIT_SIDEPANEL')
      } catch (err) {
        console.log(err)
      } finally {
        setEditButtonDisabled(false)
      }
    }
    initAragonJS()
  }, [])

  const handleOpenEditPanel = () => {
    setEditPanelData(data.organisation)
    setEditPanelOpened(true)
  }

  const handleClaimDAO = async () => {
    const votingAddress = data.organisation.proxies.find(appProxy => appProxy.app && appProxy.app.name === 'Voting')

    await wrapper.init({
      accounts: {
        providedAccounts: connected ? [account] : []
      }
    })
    const aclAddress = await wrapper.kernelProxy.contract.methods.acl().call()
    await wrapper.initAcl({
      aclAddress
    })
    console.log(data.organisation, votingAddress.address, account, wrapper, wrapper.aclProxy)
    const txPath = await wrapper.getACLTransactionPath(
      'createPermission',
      [
        account,
        daoAddress,
        MANAGE_PROFILE_ROLE,
        votingAddress.address
      ]
    )
    web3.eth.sendTransaction(txPath[0])
    console.log(txPath)
  }

  const handleAddEditorToDAO = async () => {
    await wrapper.init({
      accounts: {
        providedAccounts: connected ? [account] : []
      }
    })
    const aclAddress = await wrapper.kernelProxy.contract.methods.acl().call()
    await wrapper.initAcl({
      aclAddress
    })
    const txPath = await wrapper.getACLTransactionPath(
      'grantPermission',
      [
        account,
        daoAddress,
        MANAGE_PROFILE_ROLE
      ]
    )
    web3.eth.sendTransaction(txPath[0])
    console.log(txPath)
  }

  if (error) {
    return <Info mode='error'>An error occurred. Try again.</Info>
  }

  if (loading) {
    return <Info>Loading</Info>
  }

  const { organisation } = data

  return (
    <div>
      {editPanelData && <EditSidePanel
        opened={editPanelOpened}
        onOpen={setEditPanelOpened}
        onSet={setEditPanelData}
        onButtonDisabled={setEditButtonDisabled}
        refetchQuery={refetch}
        panelData={editPanelData}
        buttonDisabled={editButtonDisabled}
      />
      }
      <Split
        primary={
          <Box>
            <div css={`
              ${textStyle('title3')}
            `}
            >Name.
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
            {sidePanel === 'EDIT_SIDEPANEL' ? (
              <p><Button onClick={handleOpenEditPanel}>Edit Profile</Button></p>
            ) : sidePanel === 'GRANT_SIDEPANEL' ? (
              <p><Button onClick={handleAddEditorToDAO}>Request Edition Rights</Button></p>
            ) : (
              <p><Button onClick={handleClaimDAO} disabled={editButtonDisabled}>Claim Profile</Button></p>
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
