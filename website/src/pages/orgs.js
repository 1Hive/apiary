import React, { useState, useCallback, useEffect } from 'react'
import PropTypes from 'prop-types'
import { useQuery } from 'graphql-hooks'
import {
  Info,

  Split,
  Box,
  Text,

  DataView,
  IdentityBadge,
  Button,
  SyncIndicator,

  textStyle,

  useLayout,
  useTheme,

  GU
} from '@aragon/ui'
import { format } from 'date-fns'
import { WindowedPagination } from '../components/WindowedPagination'
import { SortHeader } from '../components/SortHeader'
import { NavTabs } from '../components/NavTabs/NavTabs'
import SmartLink from '../components/SmartLink/SmartLink'
import useSort from '../hooks/sort'
import openSafe from '../utils/open-safe'
import { formatNumber } from '../utils/numbers'
import { isProfileEmpty } from '../utils/utils'

const ORGANIZATIONS_QUERY = `
  query(
    $first: Int!
    $skip: Int!
  ) {
    organizations(
      first: $first,
      skip: $skip#,
    ) {
      address
      #createdAt
      profile {
        name
        description
        icon
        links
      }
    }
    orgFactories {
      orgCount
    }
  }
`

const Orgs = ({ history }) => {
  const [sort, sortBy] = useSort('createdAt', 'DESC')
  const [pagination, setPagination] = useState(0)
  const { layoutName } = useLayout()
  const theme = useTheme()

  const compactMode = layoutName === 'small'

  const page = useCallback(
    (skip) => setPagination(Math.max(skip, 0))
  )

  // Reset pagination after a new sort has been applied
  useEffect(() => {
    setPagination(0)
  }, [sort])

  const {
    loading,
    error,
    data
  } = useQuery(ORGANIZATIONS_QUERY, {
    variables: {
      first: 10,
      skip: pagination
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
  let totalOrgs = '-'
  if (!loading) {
    totalOrgs = data.orgFactories.reduce(
      (total, factory) => total + factory.orgCount, 0
    )
  }

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
              'Organization',
              <SortHeader
                key='sort-created'
                label='Created'
                onClick={() => sortBy('createdAt')}
                sortOrder={sort[0] === 'createdAt' && sort[1]}
              />
            ]}
            entries={data.organizations}
            renderEntry={({
              address,
              createdAt,
              profile = {}
            }) => [
              <div
                key='org-addr'
                css={`
                display: flex;
                align-items: center;
                margin-top: ${1 * GU}px;
              `}
              >
                {profile.icon && <img src={profile.icon} width='32px' height='auto' css={`margin-right: ${1 * GU}px;`} />}
                <IdentityBadge key='org-addr' entity={address} label={profile.name || ''} popoverTitle={profile.name || ''} />
              </div>,
              <div key='org-created-at'>
                {format(new Date(createdAt || 0), 'dd/MM/y')}
              </div>
            ]}
            renderEntryActions={({ address }) => [
              <Button
                key='view-profile'
                size='small'
                onClick={() => history.push(`/profile?dao=${address}`)}
                css='margin-right: 8px;'
              >View profile
              </Button>,
              <Button
                key='open-org'
                size='small'
                mode='strong'
                onClick={() => openSafe(`https://mainnet.aragon.org/#/${address}`)}
              >
                Open
              </Button>
            ]}
            renderEntryExpansion={({ profile }) => {
              if (isProfileEmpty(profile)) {
                return null
              }
              const profileInfo = [
                <div
                  key='description'
                  css={`
                    width: 100%;
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    grid-gap: ${3 * GU}px;
                    align-items: center;
                    justify-content: space-between;
                    align-items: start;
                    margin-top: ${0.5 * GU}px;
                  `}
                >
                  <div
                    css={`
                      align-self: center;
                      ${textStyle('label2')}
                      color: ${theme.contentSecondary}
                    `}
                  >
                    Description
                  </div>
                  <div
                    css={`
                      display: flex; justify-content: flex-end;
                      ${textStyle('body3')}
                    `}
                  >
                    {profile.description || 'No description available.'}
                  </div>
                </div>,
                <div
                  key='links'
                  css={`
                    width: 100%;
                    display: grid;
                    grid-template-columns: auto 1fr;
                    grid-gap: ${3 * GU}px;
                    align-items: center;
                    justify-content: space-between;
                    align-items: start;
                    margin-top: ${1 * GU}px;
                `}
                >
                  <div
                    css={`
                      align-self: center;
                      ${textStyle('label2')}
                      color: ${theme.contentSecondary}
                    `}
                  >
                    Links
                  </div>
                  <div css={`
                    display: flex;
                    justify-content: flex-end;
                    text-overflow: ellipsis;
                    overflow: hidden;
                    white-space: nowrap;
                    ${textStyle('body3')}
                    ${compactMode && `
                      justify-content: flex-end;
                    `}
                  `}
                  >
                    {profile.links.length > 0 ? profile.links.slice(0, 2).map(link => (
                      <SmartLink
                        key={link}
                        url={link}
                        css={`
                          display: block;
                          margin-left: ${1 * GU}px;
                          padding-left: ${1 * GU}px !important;
                        `}
                      />
                    )) : 'No links available.'}
                  </div>
                </div>
              ]
              return compactMode ? <div css='width: 100%;'>{profileInfo}</div> : profileInfo
            }}
          />
        )}
        {!firstFetch && (
          <WindowedPagination
            onPage={page}
            skip={pagination}
            resultCount={data.organizations.length}
          />
        )}
        {loading && <SyncIndicator label='Loading…' />}
      </div>}
      secondary={
        <>
          <Box>
            <Text.Block size='xlarge'>{formatNumber(totalOrgs)}</Text.Block>
            <Text>organizations</Text>
          </Box>
        </>
      }
    />
  </div>
}

Orgs.propTypes = {
  history: PropTypes.object
}

export default Orgs
