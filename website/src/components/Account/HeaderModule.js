import React from 'react'
import { ButtonBase, GU, IconDown, useTheme, useViewport } from '@aragon/ui'

function HeaderModule ({ icon, content, onClick }) {
  const { above } = useViewport()
  const theme = useTheme()

  return (
    <ButtonBase
      onClick={onClick}
      css={`
        height: 100%;
        padding: 0 ${1 * GU}px;
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

export default HeaderModule
