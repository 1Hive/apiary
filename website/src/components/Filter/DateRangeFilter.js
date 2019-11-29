import React, { useCallback } from 'react'
import PropTypes from 'prop-types'
import { DateRangePicker } from '@aragon/ui'

export const FILTER_TYPE_DATE_RANGE = Symbol('FILTER_TYPE_DATE_RANGE')
export function DateRangeFilter ({
  name,
  value = {},
  onChange
}) {
  const setDateRange = useCallback((dateRange) => {
    onChange(name, dateRange)
  }, [name])

  return <DateRangePicker
    onChange={setDateRange}
    startDate={value.start}
    endDate={value.end}
  />
}

DateRangeFilter.propTypes = {
  name: PropTypes.string.isRequired,
  value: PropTypes.shape({
    start: PropTypes.string,
    end: PropTypes.string
  }),
  onChange: PropTypes.func.isRequired
}
