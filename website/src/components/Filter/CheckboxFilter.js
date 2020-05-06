import React, { useCallback } from 'react'
import PropTypes from 'prop-types'
import { Checkbox } from '@aragon/ui'

export const FILTER_TYPE_CHECKBOX = Symbol('FILTER_TYPE_CHECKBOX')
export function CheckboxFilter ({
  name,
  value,
  onChange,
  label
}) {
  const setValue = useCallback((checked) => {
    onChange(name, checked)
  }, [name])
  const checked = value

  return <label>
    <Checkbox
      checked={checked}
      onChange={setValue}
    />
    {label}
  </label>
}

CheckboxFilter.propTypes = {
  name: PropTypes.string.isRequired,
  value: PropTypes.bool,
  label: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired
}
