export default `
  interface Node {
    id: ID!
  }

  scalar Cursor
  scalar DateTime

  type PageInfo {
    hasNextPage: Boolean!
    hasPreviousPage: Boolean!
    startCursor: Cursor
    endCursor: Cursor
  }

  enum SortOrder {
    ASC
    DESC
  }

  input StringOperators {
    eq: String
    contains: String
  }

  input BooleanOperators {
    eq: Boolean
  }

  input NumberRange {
    start: Float!
    end: Float!
  }

  input NumberOperators {
    eq: Float
    lt: Float
    lte: Float
    gt: Float
    gte: Float
    between: NumberRange
  }

  input DateRange {
    start: DateTime!
    end: DateTime!
  }

  input DateOperators {
    eq: DateTime
    before: DateTime
    after: DateTime
    between: DateRange
  }
`
