import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { DropDown } from '@aragon/ui'

export const FILTER_TYPE_LIST = Symbol('FILTER_TYPE_LIST')
export function ListFilter ({
  name,
  onChange,
  items = [],
  placeholder
}) {
  const [selectedItem, setSelectedItem] = useState()
  useEffect(() => {
    if (!items[selectedItem]) return

    onChange(name, {
      eq: items[selectedItem].value
    })
  }, [name, items, selectedItem])

  return <DropDown
    placeholder={placeholder}
    items={items.map(({ label }) => label)}
    selected={selectedItem}
    onChange={(index) => setSelectedItem(index)}
  />
}

ListFilter.propTypes = {
  name: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  items: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string.isRequired,
    value: PropTypes.any.isRequired
  })),
  placeholder: PropTypes.string
}
