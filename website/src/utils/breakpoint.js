import { css } from 'styled-components'
import { BREAKPOINTS } from '@aragon/ui'

// CSS breakpoints
export const breakpoint = (name) => (...args) => css`
  @media (min-width: ${BREAKPOINTS[name]}px) {
    ${css(...args)};
  }
`
