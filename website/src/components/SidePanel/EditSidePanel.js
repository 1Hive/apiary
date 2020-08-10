import React, { useState, useEffect, useCallback } from 'react'
import PropTypes from 'prop-types'
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

const MAX_CHARACTER_COUNT = 140
const PROFILE_PREFIX = 'PROFILE_DATA'

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
      profile {
        name
      }
    }
  }
`

function EditSidePanel ({
  address,
  description,
  icon,
  name,
  links,
  opened,
  onClose,
  refetchQuery
}) {
  const [buttonDisabled, setButtonDisabled] = useState(false)
  const [characterCountMode, setCharacterCountMode] = useState('info')
  const [saved, setSaved] = useState(false)
  const [profileName, setProfileName] = useState(name)
  const [profileDescription, setProfileDescription] = useState(description || '')
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

  useEffect(() => {
    if (profileDescription.length < 100) {
      setCharacterCountMode('info')
    }
    if (profileDescription.length >= 100) {
      setCharacterCountMode('warning')
    }
    if (profileDescription.length >= 120) {
      setCharacterCountMode('error')
    }
  }, [profileDescription])

  const handleDescriptionChange = useCallback(e => {
    if (e.target.value.length >= MAX_CHARACTER_COUNT) {
      setProfileDescription(e.target.value.substring(0, MAX_CHARACTER_COUNT))
      return
    }
    setProfileDescription(e.target.value)
  }, [])

  const removeLink = useCallback(
    index => {
      setProfileLinks(links =>
        links.length < 2
          ? []
          : links.filter((_, i) => i !== index)
      )
    }, [])

  const updateLink = useCallback((index, updatedLink) => {
    setProfileLinks(links =>
      links.map((link, i) =>
        i === index ? updatedLink : link
      )
    )
  }, [])

  const handleRefetchOnClose = useCallback(async () => {
    if (!opened && saved) {
      try {
        await refetchQuery()
      } catch (err) {
        console.error(err)
      } finally {
        setSaved(false)
      }
    }
  }, [opened])

  const handleSubmit = useCallback(async () => {
    setButtonDisabled(true)
    setSaved(true)
    try {
      const web3 = new Web3(ethereum)
      const messageToSign = composeMessage(PROFILE_PREFIX, {
        address,
        profileName,
        profileDescription,
        profileIcon,
        profileLinks
      })

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
      onClose()
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
    onClose
  ])

  return (
    <SidePanel
      title='Edit DAO profile'
      opened={opened}
      onClose={onClose}
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
      <Field
        label='Organisation Description'
        css={`
          margin-bottom: ${0.5 * GU}px;
        `}
      >
        <TextInput
          multiline
          value={profileDescription}
          onChange={handleDescriptionChange}
          css='width: 100%;'
        />
      </Field>
      <Info
        mode={characterCountMode}
        css={`
          margin-bottom: 16px;
        `}
      >
        You have {MAX_CHARACTER_COUNT - profileDescription.length} characters remaining.
      </Info>
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

EditSidePanel.propTypes = {
  address: PropTypes.string,
  description: PropTypes.string,
  icon: PropTypes.string,
  name: PropTypes.string,
  links: PropTypes.arrayOf(PropTypes.string),
  opened: PropTypes.bool,
  onClose: PropTypes.func,
  refetchQuery: PropTypes.func
}

function LinkField ({ index, link, onRemove, onUpdate }) {
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

LinkField.propTypes = {
  index: PropTypes.number,
  link: PropTypes.string,
  onRemove: PropTypes.func,
  onUpdate: PropTypes.func
}

export default EditSidePanel
