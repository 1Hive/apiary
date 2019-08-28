import React, { useState, useEffect } from 'react'
import { DropDown } from '@aragon/ui'

export const FILTER_TYPE_LIST = Symbol('FILTER_TYPE_LIST')
export function ListFilter ({
  name,
  onChange,
  items,
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
    items={items.map(({ name }) => name)}
    selected={selectedItem}
    onChange={(index) => setSelectedItem(index)}
  />
}
