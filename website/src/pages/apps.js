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
    $first: Int!
    $skip: Int!
    $orderBy: Repo_orderBy!
    $orderDirection: OrderDirection!
    $filter: Repo_filter
  ) {
    repos(
      first: $first,
      skip: $skip,
      orderBy: $orderBy,
      orderDirection: $orderDirection,
      where: $filter
    ) {
      name
      appCount
      lastVersion {
        semanticVersion
        contentUri
        manifest
      }
      registry {
        name
      }
    }
  }
`

function renderAppEntry ({
  icons,
  repository,
  name,
  ens,
  description,
  appCount
}) {
  let iconSrc
  if (icons.length) {
    iconSrc = icons[0]
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
    <div key='app-installations'>{formatNumber(appCount)}</div>
  ]
}

export default () => {
  const [sort, sortBy] = useSort('appCount', 'desc')
  const [pagination, setPagination] = useState(0)

  const page = useCallback(
    (skip) => setPagination(skip)
  )

  // Reset pagination after a new sort has been applied
  useEffect(() => {
    setPagination(0)
  }, [sort])

  const {
    loading,
    error,
    data
  } = useQuery(APPS_QUERY, {
    variables: {
      orderBy: sort[0],
      orderDirection: sort[1],
      filter: {
        appCount_gt: 0
      },
      skip: pagination,
      first: 10
    },

    // This is kind of ugly, but this identity function
    // is here to ensure that we still have data to display
    // while loading the next set of data.
    updateData: (_, data) => data
  })

  if (error) {
    return <Info mode='error'>An error occurred. Try again.</Info>
  }

  let apps = []
  if (data && data.repos) {
    apps = data.repos.map((repo) => {
      const ens = `${repo.name}.${repo.registry.name}`
      const lastVersion = repo.lastVersion || {}
      let contentUri = lastVersion.contentUri
      if (contentUri) {
        contentUri = contentUri.split(':')[1]
      }
      const {
        name,
        description,
        icons = [],
        changelog_url: changelogUrl,
        source_url: sourceUrl
      } = JSON.parse(lastVersion.manifest || null) || {}
      const appCount = repo.appCount
      const node = repo.node
      return {
        name,
        description,
        appCount,
        icons: icons.map(({ src }) => `https://gateway.ipfs.io/ipfs/${contentUri}${src}`),
        ens,
        node,
        changelogUrl,
        sourceUrl
      }
    })
  }

  const totalApps = 0
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
    <div>
      {!firstFetch && (
        <DataView
          fields={[
            'App',
            'Repository',
            <div key='sort-description'>Description</div>,
            {
              label: (
                <SortHeader
                  key='sort-installations'
                  label='Installations'
                  onClick={() => sortBy('appCount')}
                  sortOrder={sort[0] === 'appCount' && sort[1]}
                />
              ),
              align: 'end'
            }
          ]}
          entries={apps}
          renderEntry={renderAppEntry}
          renderEntryActions={({ sourceUrl, changelogUrl, node }) => [
            <ContextMenu
              key='open-org'
              disabled={!sourceUrl && !changelogUrl && !node}
            >
              {sourceUrl && (
                <ContextMenuItem onClick={() => openSafe(sourceUrl)}>Source</ContextMenuItem>
              )}
              {changelogUrl && (
                <ContextMenuItem onClick={() => openSafe(changelogUrl)}>Changelog</ContextMenuItem>
              )}
              {node && (
                <ContextMenuItem onClick={() => { window.location = `/orgs?app=${node}` }}>Organizations</ContextMenuItem>
              )}
            </ContextMenu>
          ]}
        />
      )}
      {!firstFetch && (
        <WindowedPagination
          onPage={page}
          skip={pagination}
          resultCount={apps.length}
        />
      )}
      {loading && <SyncIndicator label='Loading...' />}
    </div>
  </div>
}
