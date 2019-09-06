import React from 'react'
import styled from 'styled-components'
import { useLayout } from '@aragon/ui'

export const ContentContainer = styled.div`
  padding: ${({ compact }) => compact ? 'none' : '1em'};
  width: 100%;
`

export const Content = ({
  children
}) => {
  const { name: layout } = useLayout()

  return <ContentContainer compact={layout === 'small'}>
    {children}
  </ContentContainer>
}
