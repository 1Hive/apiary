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

  SyncIndicator,

  shortenAddress
} from '@aragon/ui'
import { WindowedPagination } from '../components/WindowedPagination'
import { SortHeader } from '../components/SortHeader'
import { NavTabs } from '../components/NavTabs/NavTabs'
import openSafe from '../utils/open-safe'
import { formatNumber } from '../utils/numbers'
import useSort from '../hooks/sort'

const APPS_QUERY = `
  query(
    $before: Cursor
    $after: Cursor
    $sort: AppConnectionSort
    $filter: AppConnectionFilter
  ) {
    apps(
      before: $before,
      after: $after,
      sort: $sort,
      filter: $filter
    ) {
      nodes {
        repository
        icons {
          src
        }
        name
        ens
        description
        installations
        sourceUrl
        changelogUrl
        hash
        score
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

function renderAppEntry ({
  icons,
  repository,
  name,
  ens,
  description,
  installations,
  score
}) {
  let iconSrc
  if (icons.length) {
    iconSrc = icons[0].src
  }

  return [
    <AppBadge
      key='app-addr'
      iconSrc={iconSrc}
      appAddress={repository}
      label={name || `Unknown (${shortenAddress(repository)})`}
      popoverTitle={name ? `${name}'s repository` : 'Repository'}
    />,
    <div key='app-repo'>{ens}</div>,
    <div key='app-description'>{description}</div>,
    <div key='app-installations'>{formatNumber(installations)}</div>,
    <div key='app-score'>{formatNumber(score * 100, 2)}</div>
  ]
}

export default () => {
  const [sort, sortBy] = useSort('score', 'DESC')
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
      filter: {
        installations: {
          gt: 0
        }
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
        label: 'Organizations',
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
              <SortHeader
                key='sort-repo'
                label='Repository'
                onClick={() => sortBy('ens')}
                sortOrder={sort[0] === 'ens' && sort[1]}
              />,
              <div key='sort-description'>Description</div>,
              {
                label: (
                  <SortHeader
                    key='sort-installations'
                    label='Installations'
                    onClick={() => sortBy('installations')}
                    sortOrder={sort[0] === 'installations' && sort[1]}
                  />
                ),
                align: 'end'
              },
              {
                label: (
                  <SortHeader
                    key='sort-score'
                    label='Score'
                    onClick={() => sortBy('score')}
                    sortOrder={sort[0] === 'score' && sort[1]}
                    help={{
                      hint: 'What is App Score?',
                      body: 'App Score is a relative weighted ranking of Applications derived from organization scores expressed as a percentage.'
                    }}
                  />
                ),
                align: 'end'
              }
            ]}
            entries={data.apps.nodes}
            renderEntry={renderAppEntry}
            renderEntryActions={({ sourceUrl, changelogUrl, hash }) => [
              <ContextMenu
                key='open-org'
                disabled={!sourceUrl && !changelogUrl && !hash}
              >
                {sourceUrl && (
                  <ContextMenuItem onClick={() => openSafe(sourceUrl)}>Source</ContextMenuItem>
                )}
                {changelogUrl && (
                  <ContextMenuItem onClick={() => openSafe(changelogUrl)}>Changelog</ContextMenuItem>
                )}
                {hash && (
                  <ContextMenuItem onClick={() => { window.location = `/orgs?app=${hash}` }}>Organizations</ContextMenuItem>
                )}
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
          <Text.Block size='xlarge'>{firstFetch ? '-' : formatNumber(data.apps.totalCount)}</Text.Block>
          <Text>apps</Text>
        </Box>
      </div>}
    />
  </div>
}
