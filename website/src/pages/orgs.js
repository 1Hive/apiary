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
import { NavTabs } from '../components/NavTabs/NavTabs'
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
        kit
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

const KITS = [
  {
    label: 'Company',
    value: ['0x705Cd9a00b87Bb019a87beEB9a50334219aC4444', '0x7f3ed10366826a1227025445D4f4e3e14BBfc91d', '0xd737632caC4d039C9B0EEcc94C12267407a271b5']
  },
  {
    label: 'Company Board',
    value: ['0x4d1A892f42c947fa952b57bc6939b27A96215CfA']
  },
  {
    label: 'Multisig',
    value: ['0x41bbaf498226b68415f1C78ED541c45A18fd7696', '0x87aa2980dde7d2D4e57191f16BB57cF80bf6E5A6']
  },
  {
    label: 'Membership',
    value: ['0x67430642C0c3B5E6538049B9E9eE719f2a4BeE7c']
  },
  {
    label: 'Reputation',
    value: ['0x3a06A6544e48708142508D9042f94DDdA769d04F']
  }
]

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
    <NavTabs
      items={[{
        label: 'Organisations',
        path: '/orgs'
      }, {
        label: 'Apps',
        path: '/apps'
      }]}
    />
    <Split
      primary={<div>
        {!firstFetch && (
          <DataView
            heading={<Filter
              filters={[{
                type: FILTER_TYPE_LIST,
                name: 'app',
                placeholder: 'Apps',
                items: APPS
              }, {
                type: FILTER_TYPE_LIST,
                name: 'kit',
                placeholder: 'Templates',
                items: KITS
              }, {
                type: FILTER_TYPE_DATE_RANGE,
                name: 'createdAt'
              }]}
              onChange={setFilter}
            />}
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
