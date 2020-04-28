import React from 'react'
import PropTypes from 'prop-types'
import { Button } from '@aragon/ui'

// eslint-disable-next-line react/display-name
export const WindowedPagination = React.memo(({
  onPage,
  pageInfo = {}
}) => {
  const {
    hasNextPage = false,
    hasPreviousPage = false,
    startCursor,
    endCursor
  } = pageInfo

  return <div css='
    display: flex;
    justifyContent: space-between;
    width: 100%;
    margin: 1em 0;
  '
  >
    <Button
      onClick={() => onPage('before', startCursor)}
      style={{
        marginRight: 'auto',
        visibility: hasPreviousPage ? 'visible' : 'hidden'
      }}
    >
      Previous
    </Button>
    <Button
      onClick={() => onPage('after', endCursor)}
      style={{
        marginLeft: 'auto',
        visibility: hasNextPage ? 'visible' : 'hidden'
      }}
    >
      Next
    </Button>
  </div>
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
