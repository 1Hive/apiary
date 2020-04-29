import React, { useState, useEffect, useCallback } from 'react'
import {
  SidePanel,
  Field,
  TextInput,
  Button,
  IconTrash,
  IconPlus,
  Info,
  GU,
  useToast,
  useTheme
} from '@aragon/ui'
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
  address,
  onOpen,
  refetchQuery,
  description,
  name,
  icon,
  links,
  opened
}) {
  const [buttonDisabled, setButtonDisabled] = useState(false)
  const [profileName, setProfileName] = useState(name)
  const [profileDescription, setProfileDescription] = useState(description)
  const [profileIcon, setProfileIcon] = useState(icon)
  const [profileLinks, setProfileLinks] = useState(links.length > 0 ? links : [''])
  const { account, ethereum } = useWallet()
  const toast = useToast()
  const theme = useTheme()

  const [updateProfile] = useMutation(UPDATE_PROFILE_MUTATION)

  useEffect(() => {
    const hasEmptyLink = profileLinks.includes('')
    if (!profileName || !profileDescription || !profileIcon || hasEmptyLink) {
      setButtonDisabled(true)
      return
    }

    if (buttonDisabled) {
      setButtonDisabled(false)
    }
  }, [profileName, profileDescription, profileIcon, profileLinks])

  const addLink = useCallback(() => {
    setProfileLinks(links => [...links, ''])
  }, [])

  const removeLink = useCallback(
    index => {
      setProfileLinks(links =>
        links.length < 2
          ? // When the remove button of the last field
        // gets clicked, we only empty the field.
          []
          : links.filter((_, i) => i !== index)
      )
      // focusLastMember()
    }, [])

  const updateLink = useCallback((index, updatedLink) => {
    setProfileLinks(links =>
      links.map((link, i) =>
        i === index ? updatedLink : link
      )
    )
  }, [])

  const handleRefetchOnClose = useCallback(async () => {
    if (!opened) {
      await refetchQuery()
    }
  }, [opened])

  const handleSubmit = useCallback(async () => {
    setButtonDisabled(true)
    try {
      const web3 = new Web3(ethereum)
      const messageToSign = composeMessage(address, profileName, profileDescription, profileIcon, profileLinks)

      const signedMessage = await web3.eth.personal.sign(messageToSign, account)
      const { error } = await updateProfile({
        variables: {
          address,
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
      toast('Update successful!')
    } catch (err) {
      console.error(err)
      toast('There was an error updating your profile.')
    } finally {
      setButtonDisabled(false)
      onOpen(false)
    }
  }, [
    account,
    ethereum,
    address,
    profileName,
    profileDescription,
    profileLinks,
    profileIcon,
    toast,
    onOpen
  ])

  return (
    <SidePanel
      title='Edit DAO profile'
      opened={opened}
      onClose={() => onOpen(false)}
      onTransitionEnd={handleRefetchOnClose}
    >
      <Field
        label='Organisation Name'
        css={`margin-top: ${2 * GU}px;`}
      >
        <TextInput
          value={profileName}
          onChange={e => {
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
      <Field
        label={
          <div
            css={`
              width: 100%;
            `}
          >
            <div>Links</div>
          </div>
        }
      >
        <div>
          {profileLinks.map((link, index) => (
            <LinkField
              key={index}
              index={index}
              link={link}
              onRemove={removeLink}
              onUpdate={updateLink}
            />
          ))}
        </div>
        <Button
          icon={
            <IconPlus
              css={`
                color: ${theme.accent};
              `}
            />
          }
          label='Add more'
          onClick={addLink}
        />
      </Field>

      <Button
        mode='strong' disabled={buttonDisabled} onClick={handleSubmit}
      >Save Profile
      </Button>
      <Info title='DAO Profile Pages' css={`margin-top: ${2 * GU}px;`}>
      Public profiles allow DAOs to associate their name, icon, description and links (such as website or chat group) to a public profile on Apiary.

      The DAO can add or remove editors by creating a vote.
      </Info>
    </SidePanel>
  )
}

function LinkField ({ index, link, onUpdate, onRemove }) {
  const theme = useTheme()

  const handleRemove = useCallback(() => {
    onRemove(index)
  }, [onRemove, index])

  const handleLinkChange = useCallback(
    event => {
      onUpdate(index, event.target.value)
    },
    [onUpdate, index]
  )

  return (
    <TextInput
      adornment={
        <span css='transform: translateY(1px)'>
          <Button
            display='icon'
            icon={
              <IconTrash
                css={`
                  color: ${theme.negative};
                `}
              />
            }
            label='Remove'
            onClick={handleRemove}
            size='mini'
          />
        </span>
      }
      adornmentPosition='end'
      adornmentSettings={{ width: 52, padding: 8 }}
      onChange={handleLinkChange}
      placeholder='Link'
      value={link}
      wide
      css={`
        margin-bottom: ${1 * GU}px;
      `}
    />

  )
}

export default EditSidePanel
