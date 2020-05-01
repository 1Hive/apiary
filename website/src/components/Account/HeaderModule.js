import React from 'react'
import PropTypes from 'prop-types'
import { ButtonBase, GU, useTheme } from '@aragon/ui'

function HeaderModule ({ icon, onClick }) {
  const theme = useTheme()

  return (
    <ButtonBase
      onClick={onClick}
      css={`
        height: 100%;
        &:active {
          background: ${theme.surfacePressed};
        }
      `}
    >
      <div
        css={`
          display: flex;
          align-items: center;
          text-align: left;
          padding: 0 ${1 * GU}px;
        `}
      >
        <>
          {icon}
        </>
      </div>
    </ButtonBase>
  )
}

HeaderModule.propTypes = {
  icon: PropTypes.node,
  content: PropTypes.node,
  onClick: PropTypes.func
}

export default HeaderModule
