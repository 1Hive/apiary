import React from 'react'
import PropTypes from 'prop-types'
import { SidePanel, Info, GU } from '@aragon/ui'

export default function RejectionSidePanel ({ onClose, opened }) {
  return (
    <SidePanel
      title='Action Impossible'
      opened={opened}
      onClose={onClose}
    >
      <Info
        mode='warning'
        title='You cannot perform this action'
        css={`
          margin-top: ${2 * GU}px;
        `}
      >
        This action is impossible. You may not have the required permissions.
      </Info>
    </SidePanel>
  )
}

RejectionSidePanel.propTypes = {
  opened: PropTypes.bool,
  onClose: PropTypes.func
}
