export default `
  # An organisation on Aragon.
  type Organisation implements Node {
    id: ID!
    # The ENS name of the organisation.
    ens: String
    # The address of the organisation.
    address: String
    # The kit of the organisation.
    kit: String
    # The pinion organisation score of the organisation.
    score: Float
    # The date and time when this organisation was created.
    createdAt: DateTime
  }

  # An edge in a connection.
  type OrganisationEdge {
    cursor: Cursor!
    node: Organisation
  }

  # The connection type for Organisation.
  type OrganisationConnection {
    edges: [OrganisationEdge]
    nodes: [Organisation]
    pageInfo: PageInfo!
    totalCount: Int!
  }

  input OrganisationConnectionFilter {
    app: StringOperators
    kit: StringOperators
    createdAt: DateOperators
  }

  input OrganisationConnectionSort {
    ens: SortOrder
    createdAt: SortOrder
    score: SortOrder
  }

  type Query {
    # Look up organisations.
    organisations(
      take: Int = 10,
      before: Cursor,
      after: Cursor,
      filter: OrganisationConnectionFilter,
      sort: OrganisationConnectionSort
    ): OrganisationConnection!
  }
`
