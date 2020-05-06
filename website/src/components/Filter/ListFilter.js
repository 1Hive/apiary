import React, { useCallback } from 'react'
import PropTypes from 'prop-types'
import { DropDown } from '@aragon/ui'

export const FILTER_TYPE_LIST = Symbol('FILTER_TYPE_LIST')
export function ListFilter ({
  name,
  value,
  onChange,
  items = [],
  label
}) {
  const setSelectedItem = useCallback((index) => {
    if (!items[index]) return

    onChange(name, items[index].value)
  }, [name, items])
  const selectedItem = items.findIndex(
    (item) => item.value === value
  )

  return <DropDown
    label={label}
    items={items.map(({ label }) => label)}
    selected={selectedItem}
    onChange={setSelectedItem}
  />
}

ListFilter.propTypes = {
  name: PropTypes.string.isRequired,
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  items: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string.isRequired,
    value: PropTypes.any.isRequired
  })),
  label: PropTypes.string
}
