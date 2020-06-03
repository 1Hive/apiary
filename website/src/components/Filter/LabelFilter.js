import React from 'react'
import PropTypes from 'prop-types'
import { Tag } from '@aragon/ui'

export const FILTER_TYPE_LABEL = Symbol('FILTER_TYPE_LABEL')
export function LabelFilter ({ label, value }) {
  return value ? <Tag css={{ 'align-self': 'center' }} uppercase={false} mode="identifier">{label}: {value}</Tag> : <></>
}

LabelFilter.propTypes = {
  value: PropTypes.string,
  label: PropTypes.string
}
