import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { _DateRange as DateRange } from '@aragon/ui'

export const FILTER_TYPE_DATE_RANGE = Symbol('FILTER_TYPE_DATE_RANGE')
export function DateRangeFilter ({
  name,
  onChange
}) {
  const [dateRange, setDateRange] = useState({})
  useEffect(() => {
    if (!dateRange.start || !dateRange.end) return

    onChange(name, {
      between: dateRange
    })
  }, [name, dateRange])

  return <DateRange
    onChange={setDateRange}
    startDate={dateRange.start}
    endDate={dateRange.end}
  />
}

DateRangeFilter.propTypes = {
  name: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired
}
