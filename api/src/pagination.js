import { ObjectId } from 'mongodb'

export async function makeConnection (
  query, {
    take,
    before,
    after
  },
  filter = {},
  sort = {}
) {
  return applyPagination(
    query,
    take,
    before,
    after,
    filter,
    sort
  )
}

export async function applyPagination (
  query,
  take,
  before,
  after,
  filter = {},
  sort = {}
) {
  const sortField = Object.keys(sort)[0] || '_id'
  const sortOrder = sort[sortField] || 'DESC'

  const totalCount = await query
    .find(filter)
    .count()

  let documents = await query
    .find(Object.assign(
      filter,
      cursorQueryConstraints(after, before, sortField, sortOrder)
    ))
    .sort(cursorQuerySort(after, before, sortField, sortOrder))
    .limit(take + 1)
    .toArray()

  // Remove extra document we added to peek
  const hasMore = documents.length > take
  if (hasMore) {
    documents.pop()
  }

  // If we sorted reversely we should correct the sort order
  if (before) {
    documents = documents.reverse()
  }

  const {
    startCursor,
    endCursor
  } = navigationCursors(
    documents,
    sortField,
    sortOrder
  )

  return {
    documents,
    pageInfo: {
      hasNextPage: Boolean(!!before || hasMore),
      hasPreviousPage: Boolean(!!after || !!(before && hasMore)),
      startCursor,
      endCursor
    },
    totalCount
  }
}

export function navigationCursors (
  documents,
  sortField,
  sortOrder
) {
  const firstDocument = documents[0] || {}
  const lastDocument = documents[documents.length - 1] || {}

  const secondarySortOnId = sortField !== '_id'
  const previous = [
    firstDocument._id
      ? firstDocument._id.toString()
      : null
  ]
  const next = [
    lastDocument._id
      ? lastDocument._id.toString()
      : null
  ]
  if (secondarySortOnId) {
    previous.unshift(firstDocument[sortField])
    next.unshift(lastDocument[sortField])
  }

  return {
    startCursor: {
      value: previous
    },
    endCursor: {
      value: next
    }
  }
}

export function cursorQuerySort (
  after,
  before,
  sortField,
  sortOrder
) {
  const sortAsc = (sortOrder !== 'ASC' && before) || (sortOrder === 'ASC' && !before)
  const sortDirection = sortAsc ? 1 : -1
  const secondarySortOnId = sortField !== '_id'

  if (secondarySortOnId) {
    return {
      [sortField]: sortDirection,
      _id: sortDirection
    }
  }

  return {
    [sortField]: sortDirection
  }
}

export function cursorQueryConstraints (
  after,
  before,
  sortField,
  sortOrder
) {
  if (!before && !after) return {}

  const sortAsc = (sortOrder !== 'ASC' && before) || (sortOrder === 'ASC' && !before)
  const comparisonOp = sortAsc ? '$gt' : '$lt'
  const secondarySortOnId = sortField !== '_id'

  const cursor = after || before

  if (secondarySortOnId) {
    return {
      $or: [{
        [sortField]: {
          [comparisonOp]: cursor[0]
        }
      }, {
        [sortField]: {
          $eq: cursor[0]
        },
        _id: {
          [comparisonOp]: ObjectId(cursor[1])
        }
      }]
    }
  }

  return {
    [sortField]: {
      [comparisonOp]: ObjectId(cursor[0])
    }
  }
}
