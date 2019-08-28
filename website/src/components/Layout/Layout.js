import styled from 'styled-components'
import { breakpoint } from '../../utils/breakpoint'

export const Layout = styled.div`
  display: flex;
  flex-direction: column;
  ${breakpoint('medium')`
    flex-direction: row;
  `}
`
