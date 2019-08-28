import { useState, useCallback } from 'react'

export function inverseSortDirection (sortDirection) {
  return sortDirection === 'ASC' ? 'DESC' : 'ASC'
}

export default function useSort (
  defaultField,
  defaultOrder
) {
  const [sort, setSort] = useState([defaultField, defaultOrder])

  const sortBy = useCallback((field) => {
    setSort((sort) => [
      field,
      sort[0] === field ? inverseSortDirection(sort[1]) : 'ASC'
    ])
  }, [])

  return [sort, sortBy]
}
