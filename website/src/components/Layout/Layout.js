import React, { useMemo } from 'react'
import PropTypes from 'prop-types'
import { BREAKPOINTS, useViewport, Layout as BaseLayout } from '@aragon/ui'
import { breakpoint } from '../../utils/breakpoint'

function getSizes (breakpoints) {
  return Object.entries(breakpoints)
    .filter(([name]) => name !== 'min')
    .sort((a, b) => a[1] - b[1])
}

function getLayoutSize (parentWidth, breakpoints) {
  const sizes = getSizes(breakpoints)

  let index = sizes.length
  while (index--) {
    if (parentWidth >= sizes[index][1]) {
      return [
        sizes[index][0],
        sizes[index][1]
      ]
    }
  }

  return sizes[0]
}

function Layout ({
  children,
  ...props
}) {
  const { width: viewportWidth } = useViewport()

  const [layoutName, layoutWidth] = useMemo(
    () =>
      getLayoutSize(
        viewportWidth,
        BREAKPOINTS
      ),
    [viewportWidth]
  )

  return (
    <BaseLayout.__Context.Provider value={{ layoutWidth, layoutName }}>
      <div
        {...props}
        css={`
          display: flex;
          flex-direction: column;
          ${breakpoint('medium')`
            flex-direction: row;
          `}
          margin: 0 auto;
        `}
      >
        {children}
      </div>
    </BaseLayout.__Context.Provider>
  )
}

Layout.propTypes = {
  children: PropTypes.node
}

export { Layout }
