import React, { useState, useCallback, useEffect } from 'react'
import { useQuery } from 'graphql-hooks'
import {
  Info,

  Split,
  Box,
  Text,

  DataView,
  IdentityBadge,
  Button,
  SyncIndicator
} from '@aragon/ui'
import { format } from 'date-fns'
import { WindowedPagination } from '../components/WindowedPagination'
import { SortHeader } from '../components/SortHeader'
import {
  Filter,

  FILTER_TYPE_DATE_RANGE,
  FILTER_TYPE_LIST
} from '../components/Filter'
import useSort from '../hooks/sort'
import openSafe from '../utils/open-safe'

const ORGANISATIONS_QUERY = `
  query(
    $before: Cursor
    $after: Cursor
    $sort: OrganisationConnectionSort
    $filter: OrganisationConnectionFilter
  ) {
    organisations(
      before: $before,
      after: $after,
      sort: $sort,
      filter: $filter
    ) {
      nodes {
        id
        address
        ens
        createdAt
      }
      pageInfo {
        startCursor
        endCursor
        hasPreviousPage
        hasNextPage
      }
      totalCount
    }
  }
`

export default () => {
  const [sort, sortBy] = useSort('createdAt', 'DESC')
  const [pagination, setPagination] = useState(['after'])
  const [filter, setFilter] = useState()

  const page = useCallback(
    (direction, cursor) => setPagination([direction, cursor])
  )

  // Reset pagination after a new sort or filter has been applied
  useEffect(() => {
    setPagination([])
  }, [sort, filter])

  const {
    loading,
    error,
    data
  } = useQuery(ORGANISATIONS_QUERY, {
    variables: {
      sort: {
        [sort[0]]: sort[1]
      },
      filter,
      [pagination[0]]: pagination[1]
    },

    // This is kind of ugly, but this identity function
    // is here to ensure that we still have data to display
    // while loading the next set of data.
    updateData: (_, data) => data
  })

  if (error) {
    return <Info mode='error'>An error occurred. Try again.</Info>
  }

  const firstFetch = loading && !data
  return <div>
    <Filter
      filters={[{
        type: FILTER_TYPE_LIST,
        name: 'app',
        placeholder: 'Apps',
        items: []
      }, {
        type: FILTER_TYPE_DATE_RANGE,
        name: 'createdAt'
      }]}
      onChange={setFilter}
    />
    <Split
      primary={<div>
        {!firstFetch && (
          <DataView
            fields={[
              <SortHeader
                label='Organisation'
                onClick={() => sortBy('ens')}
                sortOrder={sort[0] === 'ens' && sort[1]}
              />,
              <SortHeader
                label='Created'
                onClick={() => sortBy('createdAt')}
                sortOrder={sort[0] === 'createdAt' && sort[1]}
              />
            ]}
            entries={data.organisations.nodes}
            renderEntry={({ address, ens, createdAt }) => [
              <IdentityBadge entity={address} customLabel={ens} />,
              format(new Date(createdAt), 'dd/MM/y')
            ]}
            renderEntryActions={({ address, ens }) => [
              <Button
                size='small'
                mode='strong'
                onClick={() => openSafe(`https://mainnet.aragon.org/#/${ens || address}`)}
              >
                Open
              </Button>
            ]}
          />
        )}
        {!firstFetch && (
          <WindowedPagination
            onPage={page}
            pageInfo={data.organisations.pageInfo}
          />
        )}
        {loading && <SyncIndicator label='Loading...' />}
      </div>}
      secondary={<Box>
        <Text.Block size='xlarge'>{firstFetch ? '-' : data.organisations.totalCount}</Text.Block>
        <Text>organisations</Text>
      </Box>}
    />
  </div>
}
