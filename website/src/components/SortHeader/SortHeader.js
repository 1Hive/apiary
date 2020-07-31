import React from 'react'
import PropTypes from 'prop-types'
import {
  IconDown,
  IconUp,
  Help,
  unselectable
} from '@aragon/ui'

export function SortHeader ({
  onClick,
  label,
  sortOrder = 'none',
  help
}) {
  return (
    <span
      css={`
        display: inline-flex;
        align-items: center;
        cursor: pointer;
        ${unselectable};
      `}
    >
      <span
        onClick={onClick}
        css='margin: 2px 5px 0 0;'
      >
        {label}
      </span>
      <span css='margin-right: 2px'>
        {help && <Help hint={help.hint}>
          {help.body}
        </Help>}
      </span>
      {sortOrder === 'desc' && <IconDown size='tiny' />}
      {sortOrder === 'asc' && <IconUp size='tiny' />}
    </span>
  )
}

SortHeader.propTypes = {
  onClick: PropTypes.func.isRequired,
  label: PropTypes.string.isRequired,
  sortOrder: PropTypes.oneOf([
    'asc',
    'desc',
    'none'
  ]),
  help: PropTypes.shape({
    hint: PropTypes.string.isRequired,
    body: PropTypes.node.isRequired
  })
}
