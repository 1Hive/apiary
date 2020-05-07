import React, { useState, useCallback, useMemo, useEffect } from 'react'
import PropTypes from 'prop-types'
import qs from 'qs'
import { Button, GU } from '@aragon/ui'
import { FILTER_TYPE_DATE_RANGE, DateRangeFilter } from './DateRangeFilter'
import { FILTER_TYPE_LIST, ListFilter } from './ListFilter'
import { FILTER_TYPE_CHECKBOX, CheckboxFilter } from './CheckboxFilter'
import { useLocation } from '../../hooks/router'
import { breakpoint } from '../../utils/breakpoint'

function transformFilterValue (
  filterType,
  filterValue
) {
  switch (filterType) {
    case FILTER_TYPE_DATE_RANGE:
      return {
        between: filterValue
      }
    case FILTER_TYPE_LIST:
      if (filterValue instanceof Array) {
        return {
          in: filterValue
        }
      }

      return {
        eq: filterValue
      }
    case FILTER_TYPE_CHECKBOX:
      return filterValue
    default:
      throw new Error(`Unknown filter type ${filterType}`)
  }
}

export function Filter ({
  filters = [],
  onChange
}) {
  const { location, navigate } = useLocation()
  const [filterState, setFilterState] = useState(
    qs.parse(location.search.slice(1))
  )

  const setFilterValue = useCallback((filterName, filterValue) => {
    setFilterState((currentFilter) => ({
      ...currentFilter,
      [filterName]: filterValue
    }))
  })

  const transformedFilter = useMemo(() => {
    return Object.keys(filterState).reduce((f, filterName) => {
      const filter = filters.find(
        (filter) => filter.name === filterName
      )

      if (!filter) return

      f[filter.name] = transformFilterValue(filter.type, filterState[filter.name])

      return f
    }, {})
  }, [filters.length, filterState])

  useEffect(() => {
    onChange(transformedFilter)
  }, [transformedFilter])

  useEffect(() => {
    navigate({
      search: qs.stringify(filterState)
    }, { replace: true })
  }, [filterState])

  const isFilterNotEmpty = !!Object.keys(filterState).length
  const clearFilter = useCallback(() => {
    setFilterState({})
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
  `}
  >
    {filters.map((filter) => {
      switch (filter.type) {
        case FILTER_TYPE_LIST:
          return <ListFilter
            name={filter.name}
            value={filterState[filter.name]}
            onChange={setFilterValue}
            items={filter.items}
            label={filter.label}
          />
        case FILTER_TYPE_DATE_RANGE:
          return <DateRangeFilter
            name={filter.name}
            value={filterState[filter.name]}
            onChange={setFilterValue}
          />
        case FILTER_TYPE_CHECKBOX:
          return <CheckboxFilter
            name={filter.name}
            value={filterState[filter.name]}
            onChange={setFilterValue}
            label={filter.label}
          />
        default:
          throw new Error(`Unknown filter type ${filter.type}`)
      }
    })}
    {isFilterNotEmpty &&
      <Button
        css={breakpoint('medium')`grid-column: ${columns};`}
        onClick={clearFilter}
      >
        Clear
      </Button>}
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
