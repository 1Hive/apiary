import React, { useState, useCallback, useEffect } from 'react'
import PropTypes from 'prop-types'
import { Button, GU } from '@aragon/ui'
import { FILTER_TYPE_DATE_RANGE, DateRangeFilter } from './DateRangeFilter'
import { FILTER_TYPE_LIST, ListFilter } from './ListFilter'
import { breakpoint } from '../../utils/breakpoint'

export function Filter ({
  filters = [],
  onChange
}) {
  const [filter, setFilter] = useState({})

  const setFilterValue = useCallback((key, value) => {
    setFilter((currentFilter) => ({
      ...currentFilter,
      [key]: value
    }))
  })

  useEffect(() => {
    onChange(filter)
  }, [filter])

  const hasFilter = !!Object.keys(filter).length
  const clearFilter = useCallback(() => {
    setFilter({})
  }, [])

  const columns = Math.max(
    filters.length + 1,
    12
  )

  return <div css={`
    display: grid;
    grid-gap: ${1 * GU}px;
    grid-template-columns: 1fr;

    ${breakpoint('medium')`
      grid-template-columns: repeat(${columns}, 1fr);
      grid-template-rows: auto;
    `}
  `}>
    {filters.map((filter) => {
      switch (filter.type) {
        case FILTER_TYPE_LIST:
          return <ListFilter
            name={filter.name}
            onChange={setFilterValue}
            items={filter.items}
            placeholder={filter.placeholder}
          />
        case FILTER_TYPE_DATE_RANGE:
          return <DateRangeFilter
            name={filter.name}
            onChange={setFilterValue}
          />
        default:
          throw new Error(`Unknown filter type ${filter.type}`)
      }
    })}
    {hasFilter &&
      <Button
        css={breakpoint('medium')`grid-column: ${columns};`}
        onClick={clearFilter}
      >
        Clear
      </Button>
    }
  </div>
}

Filter.propTypes = {
  filters: PropTypes.arrayOf(PropTypes.shape({
    type: PropTypes.oneOf([
      FILTER_TYPE_LIST,
      FILTER_TYPE_DATE_RANGE
    ]).isRequired,
    name: PropTypes.string.isRequired
  })),
  onChange: PropTypes.func.isRequired
}
