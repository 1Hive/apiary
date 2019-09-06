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

// 1Hive curated list of Good Apps™️
const APPS = [{
  label: 'Token Manager',
  value: '0x6b20a3010614eeebf2138ccec99f028a61c811b3b1a3343b6ff635985c75c91f'
}, {
  label: 'Vault',
  value: '0x7e852e0fcfce6551c13800f1e7476f982525c2b5277ba14b24339c68416336d1'
}, {
  label: 'Agent',
  value: '0x9ac98dc5f995bf0211ed589ef022719d1487e5cb2bab505676f0d084c07cf89a'
}, {
  label: 'Finance',
  value: '0xbf8491150dafc5dcaee5b861414dca922de09ccffa344964ae167212e8c673ae'
}, {
  label: 'Voting',
  value: '0x9fa3927f639745e587912d4b0fea7ef9013bf93fb907d29faeab57417ba6e1d4'
}]

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
        items: APPS
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
                key='sort-org'
                label='Organisation'
                onClick={() => sortBy('ens')}
                sortOrder={sort[0] === 'ens' && sort[1]}
              />,
              <SortHeader
                key='sort-created'
                label='Created'
                onClick={() => sortBy('createdAt')}
                sortOrder={sort[0] === 'createdAt' && sort[1]}
              />
            ]}
            entries={data.organisations.nodes}
            renderEntry={({ address, ens, createdAt }) => [
              <IdentityBadge
                key='org-addr'
                entity={address}
                customLabel={ens}
                popoverTitle={ens}
              />,
              <div key='org-created-at'>
                {format(new Date(createdAt), 'dd/MM/y')}
              </div>
            ]}
            renderEntryActions={({ address, ens }) => [
              <Button
                key='open-org'
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
