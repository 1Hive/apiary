import React from 'react'
import {
  IconDown,
  IconUp,
  unselectable
} from '@aragon/ui'

export function SortHeader ({
  onClick,
  label,
  sortOrder = 'none'
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
