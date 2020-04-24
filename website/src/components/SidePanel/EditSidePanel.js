import React, { useState } from 'react'
import { SidePanel, Field, TextInput, Button, Info, GU, useToast } from '@aragon/ui'
import { useMutation } from 'graphql-hooks'

const UPDATE_PROFILE_MUTATION = `
  mutation(
    $ens: String!,
    $name: String,
    $description: String,
    $icon: String,
    $links: [String]
  ) {
    updateProfile(
      ens: $ens,
      name: $name,
      description: $description,
      icon: $icon,
      links: $links
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
  opened 
}) {
  const toast = useToast()
  const [updateProfile] = useMutation(UPDATE_PROFILE_MUTATION)

  return (
    <SidePanel title='Edit DAO profile' opened={opened} onClose={() => onOpen(false)}>
      <Field
        label='Organisation Name'
        css={`margin-top: ${2 * GU}px;`}
      >
        <TextInput
          value={panelData && panelData.profile.name}
          onChange={e => {
            onSet({ ...panelData, profile: { ...panelData.profile, name: e.target.value } })}
          }
          css='width: 100%;'
        />
      </Field>
      <Field label='Organisation Icon URL'>
        <TextInput
          value={panelData && panelData.profile.icon}
          onChange={e => onSet({ ...panelData, profile: { ...panelData.profile, icon: e.target.value } })}
          css='width: 100%;'
        />
      </Field>
      <Field label='Organisation Description'>
        <TextInput
          multiline
          value={panelData && panelData.profile.description}
          onChange={e => onSet({ ...panelData, profile: { ...panelData.profile, description: e.target.value } })}
          css='width: 100%;'
        />
      </Field>
      <Button
        mode='strong' disabled={buttonDisabled} onClick={() => {
          onButtonDisabled(true)
          try {
            updateProfile({
              variables: {
                ens: panelData.ens,
                name: panelData.profile.name,
                description: panelData.profile.description,
                icon: panelData.profile.icon,
                links: panelData.profile.links
              }
            })
              .then(refetchQuery)
              .then(() => { onOpen(false) })
            toast('Update successful!')
          } catch (err) {
            toast('There was an error updating your profile.')
          } finally {
            onButtonDisabled(false)
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
