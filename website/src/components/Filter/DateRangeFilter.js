import React, { useCallback } from 'react'
import PropTypes from 'prop-types'
import { _DateRange as DateRange } from '@aragon/ui'

export const FILTER_TYPE_DATE_RANGE = Symbol('FILTER_TYPE_DATE_RANGE')
export function DateRangeFilter ({
  name,
  value = {},
  onChange
}) {
  const setDateRange = useCallback((dateRange) => {
    onChange(name, dateRange)
  }, [name])

  return <DateRange
    onChange={setDateRange}
    startDate={value.start}
    endDate={value.end}
  />
}

DateRangeFilter.propTypes = {
  name: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired
}
