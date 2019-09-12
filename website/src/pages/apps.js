import React, { useState, useCallback, useEffect } from 'react'
import { useQuery } from 'graphql-hooks'
import {
  Info,

  Split,
  Box,
  Text,

  DataView,
  AppBadge,
  ContextMenu,
  ContextMenuItem,

  SyncIndicator
} from '@aragon/ui'
import { WindowedPagination } from '../components/WindowedPagination'
import { SortHeader } from '../components/SortHeader'
import { NavTabs } from '../components/NavTabs/NavTabs'
import useSort from '../hooks/sort'

const APPS_QUERY = `
  query(
    $before: Cursor
    $after: Cursor
    $sort: AppConnectionSort
  ) {
    apps(
      before: $before,
      after: $after,
      sort: $sort
    ) {
      nodes {
        repository
        name
        description
        installations
        sourceUrl
        changelogUrl
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
  const [sort, sortBy] = useSort('installations', 'DESC')
  const [pagination, setPagination] = useState(['after'])

  const page = useCallback(
    (direction, cursor) => setPagination([direction, cursor])
  )

  // Reset pagination after a new sort has been applied
  useEffect(() => {
    setPagination([])
  }, [sort])

  const {
    loading,
    error,
    data
  } = useQuery(APPS_QUERY, {
    variables: {
      sort: {
        [sort[0]]: sort[1]
      },
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
            fields={[
              <SortHeader
                key='sort-app'
                label='App'
                onClick={() => sortBy('name')}
                sortOrder={sort[0] === 'name' && sort[1]}
              />,
              <div key='sort-description'>Description</div>,
              <SortHeader
                key='sort-installations'
                label='Installations'
                onClick={() => sortBy('installations')}
                sortOrder={sort[0] === 'installations' && sort[1]}
              />
            ]}
            entries={data.apps.nodes}
            renderEntry={({ repository, name, description, installations }) => [
              <AppBadge
                key='app-addr'
                appAddress={repository}
                label={name}
                popoverTitle={name ? `${name}'s repository` : 'Repository'}
              />,
              <div key='app-description'>{description}</div>,
              <div key='app-installations'>{installations}</div>
            ]}
            renderEntryActions={({ sourceUrl, changelogUrl }) => [
              <ContextMenu
                key='open-org'
                disabled={!sourceUrl && !changelogUrl}
              >
                {sourceUrl && <ContextMenuItem>Source</ContextMenuItem>}
                {changelogUrl && <ContextMenuItem>Changelog</ContextMenuItem>}
              </ContextMenu>
            ]}
          />
        )}
        {!firstFetch && (
          <WindowedPagination
            onPage={page}
            pageInfo={data.apps.pageInfo}
          />
        )}
        {loading && <SyncIndicator label='Loading...' />}
      </div>}
      secondary={<div>
        <Box>
          <Text.Block size='xlarge'>{firstFetch ? '-' : data.apps.totalCount}</Text.Block>
          <Text>apps</Text>
        </Box>
      </div>}
    />
  </div>
}
