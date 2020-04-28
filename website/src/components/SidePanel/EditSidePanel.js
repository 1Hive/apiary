import React, { useState } from 'react'
import { SidePanel, Field, TextInput, Button, Info, GU, useToast } from '@aragon/ui'
import { useMutation } from 'graphql-hooks'
import { useWallet } from 'use-wallet'
import Web3 from 'web3'
import { composeMessage } from '../../utils/utils'

const UPDATE_PROFILE_MUTATION = `
  mutation(
    $address: String!,
    $name: String,
    $description: String,
    $icon: String,
    $links: [String],
    $signerAddress: String!,
    $signedMessage: String!
  ) {
    updateProfile(
      address: $address,
      name: $name,
      description: $description,
      icon: $icon,
      links: $links,
      signerAddress: $signerAddress,
      signedMessage: $signedMessage,
    ) {
      ens
      profile {
        name
      }
    }
  }
`

function EditSidePanel ({
  onOpen,
  onSet,
  onButtonDisabled,
  refetchQuery,
  panelData,
  buttonDisabled,
  opened,
  web3
}) {
  const [profileName, setProfileName] = useState(panelData.profile.name)
  const [profileDescription, setProfileDescription] = useState(panelData.profile.description)
  const [profileIcon, setProfileIcon] = useState(panelData.profile.icon)
  const [profileLinks, setProfileLinks] = useState(panelData.profile.links)
  const toast = useToast()
  const { account, ethereum } = useWallet()

  const [updateProfile] = useMutation(UPDATE_PROFILE_MUTATION)

  return (
    <SidePanel title='Edit DAO profile' opened={opened} onClose={() => onOpen(false)}>
      <Field
        label='Organisation Name'
        css={`margin-top: ${2 * GU}px;`}
      >
        <TextInput
          value={profileName}
          onChange={e => {
            console.log(e.target.value)
            setProfileName(e.target.value)
          }}
          css='width: 100%;'
        />
      </Field>
      <Field label='Organisation Icon URL'>
        <TextInput
          value={profileIcon}
          onChange={e => setProfileIcon(e.target.value)}
          css='width: 100%;'
        />
      </Field>
      <Field label='Organisation Description'>
        <TextInput
          multiline
          value={profileDescription}
          onChange={e => setProfileDescription(e.target.value)}
          css='width: 100%;'
        />
      </Field>
      <Button
        mode='strong' disabled={buttonDisabled} onClick={async () => {
          onButtonDisabled(true)
          try {
            const web3 = new Web3(ethereum)
            const messageToSign = composeMessage(panelData.address, profileName, profileDescription, profileIcon, profileLinks)
            console.log(messageToSign)
            const signedMessage = await web3.eth.personal.sign(messageToSign, account)
            const { error } = await updateProfile({
              variables: {
                address: panelData.address,
                name: profileName,
                description: profileDescription,
                icon: profileIcon,
                links: profileLinks,
                signerAddress: account,
                signedMessage
              }
            })
            if (error) {
              toast('There was an error updating your profile.')
              return
            }
            await refetchQuery()
            toast('Update successful!')
          } catch (err) {
            console.log(err)
            toast('There was an error updating your profile.')
          } finally {
            onButtonDisabled(false)
            onOpen(false)
          }
        }}
      >Save Profile
      </Button>
      <Info title='DAO Profile Pages' css={`margin-top: ${2 * GU}px;`}>
      Public profiles allow DAOs to associate their name, icon, description and links (such as website or chat group) to a public profile on Apiary.

      The DAO can add or remove editors by creating a vote.
      </Info>
    </SidePanel>
  )
}

export default EditSidePanel
