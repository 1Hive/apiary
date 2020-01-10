import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { useTheme, useThemeMode } from '@aragon/ui'
import { breakpoint } from '../../utils/breakpoint'

const SidebarOuter = styled.div`
  width: 100%;
  ${breakpoint('medium')`
    width: 75px;
  `}
`

export function Sidebar ({ children }) {
  const theme = useTheme()
  const themeMode = useThemeMode()
  return <SidebarOuter>
    <div
      css={`
        display: flex;
        align-items: center;
        padding: 16px;
        background-color: ${themeMode.mode === 'dark' ? theme.surface : 'rgb(224, 230, 240)'};
        justify-content: space-between;

        ${breakpoint('medium')`
          position: fixed;
          height: 100%;
          flex-direction: column;
          justify-content: normal;
        `}

        > a {
          display: block;
          height: 43px;
          width: 43px;

          ${breakpoint('medium')`
            margin-bottom: 25px;
          `}

          > svg {
            width: 43px;
            height: 43px;
            color: #979797;
            padding: 5px;
          }

          &.active, &:hover {
            > svg {
              color: #7C80F2;
              cursor: pointer;
              background-color: rgba(0, 0, 0, 0.05);
              border-radius: 25%;
            }
          }
        }

        .logo {
          width: 41px;
          height: 41px;
          margin-top: auto;
        }
      `}
    >
      {children}
    </div>
  </SidebarOuter>
}

Sidebar.propTypes = {
  children: PropTypes.node
}
