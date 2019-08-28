import React from 'react'
import PropTypes from 'prop-types'
import {
  IconDown,
  IconUp,
  unselectable
} from '@aragon/ui'

export function SortHeader ({
  onClick,
  label,
  sortOrder = 'NONE'
}) {
  return (
    <span
      onClick={onClick}
      css={`
        display: inline-flex;
        align-items: center;
        cursor: pointer;
        ${unselectable};
      `}
    >
      <span css='margin: 2px 5px 0 0;'>{label}</span>
      {sortOrder === 'DESC' && <IconDown size="tiny" />}
      {sortOrder === 'ASC' && <IconUp size="tiny" />}
    </span>
  )
}

SortHeader.propTypes = {
  onClick: PropTypes.func.isRequired,
  label: PropTypes.string.isRequired,
  sortOrder: PropTypes.oneOf([
    'ASC',
    'DESC',
    'NONE'
  ])
}
