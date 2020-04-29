import React from 'react'
import { Info, RadioList, SidePanel, GU } from '@aragon/ui'

function TransactionSidePanel ({
  title,
  transactionPath,
  opened,
  onClose,
  onClick
}) {
  return (
    <SidePanel
      title="Create transaction"
      opened={opened}
    >
      <div
        css={`
          margin-top: ${ 2 * GU }px;
        `}
      >
        <Info mode="warning" title="Permission note">
          You cannot directly perform this action. You do not have the
          necessary permissions.
        </Info>
        <RadioList
          title="Action Requirement"
          description='You can perform this action through:'
          items={radioItems}
          onChange={this.handleChange}
          selected={selected}
        />
      </div>
    </SidePanel>
  )
}
