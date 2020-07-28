import React from 'react'
import PropTypes from 'prop-types'
import { Button } from '@aragon/ui'

const PAGE_SIZE = 10

// eslint-disable-next-line react/display-name
export const WindowedPagination = React.memo(({
  onPage,
  skip = 0,
  resultCount = 0
}) => {
  const hasNextPage = resultCount >= PAGE_SIZE
  const hasPreviousPage = skip > 0

  return (
    <div
      css={`
        display: flex;
        justifyContent: space-between;
        width: 100%;
        margin: 1em 0;
      `}
    >
      <Button
        onClick={() => onPage(skip - PAGE_SIZE)}
        style={{
          marginRight: 'auto',
          visibility: hasPreviousPage ? 'visible' : 'hidden'
        }}
      >
        Previous
      </Button>
      <Button
        onClick={() => onPage(skip + PAGE_SIZE)}
        style={{
          marginLeft: 'auto',
          visibility: hasNextPage ? 'visible' : 'hidden'
        }}
      >
      Next
      </Button>
    </div>
  )
})

WindowedPagination.propTypes = {
  onPage: PropTypes.func.isRequired,
  pageInfo: PropTypes.shape({
    hasPreviousPage: PropTypes.bool,
    hasNextPage: PropTypes.bool,
    startCursor: PropTypes.string,
    endCursor: PropTypes.string
  })
}
