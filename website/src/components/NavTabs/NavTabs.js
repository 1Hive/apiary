import React, { useCallback } from 'react'
import PropTypes from 'prop-types'
import { Tabs } from '@aragon/ui'
import { useLocation } from '../../hooks/router'

export const NavTabs = ({
  items = []
}) => {
  const { location, navigate } = useLocation()
  const setTab = useCallback((index) => {
    navigate(items[index].path)
  })

  return <Tabs
    items={items.map(({ label }) => label)}
    onChange={setTab}
    selected={items.findIndex(({ path }) => path === location.pathname)}
  />
}

NavTabs.propTypes = {
  items: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string.isRequired,
    path: PropTypes.string.isRequired
  }))
}
