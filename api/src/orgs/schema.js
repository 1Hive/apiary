export default `
  # An organization's own profile.
  type Profile {
    # The human-readable name of the organisation.
    name: String
    # URL to the organisation's icon.
    icon: String
    # Array of URL to the different links for the organisation (ex: Discord, Discourse)
    links: [String]!
    # Array of addresses from the people that have edited the profile at least once
    editors: [String]!
    # The description of the organisation.
    description: String
  }

  # An organisation on Aragon.
  type Organisation implements Node {
    id: ID!
    # The ENS name of the organisation.
    ens: String
    # The address of the organisation.
    address: String
    # The kit of the organisation.
    kit: String
    # The total amount of assets under management (in Dai) for the organisation.
    aum: Float!
    # The total amount of ANT held in the organisation.
    ant: Float!
    # The total amount of activity in the last 30 days (rolling) for the organisation.
    activity: Int!
    # The profile of the organisation.
    profile: Profile
    # The pinion organisation score of the organisation.
    score: Float!
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
    # The total number of organisations relevant to this connection.
    totalCount: Int!
    # The total AUM for all organisations in this connection.
    totalAUM: Float!
    # The total number of activities for all organisations in this connection.
    totalActivity: Float!
  }

  input OrganisationConnectionFilter {
    app: StringOperators
    kit: StringOperators
    createdAt: DateOperators
  }

  input OrganisationConnectionSort {
    ens: SortOrder
    createdAt: SortOrder
    aum: SortOrder
    activity: SortOrder
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

    organisation(
      address: String!
    ): Organisation!
  }

  type Mutation {
    # Update organisation profiles.
    updateProfile(
      # The organization id.
      address: String!,
      name: String,
      icon: String,
      links: [String],
      description: String,
      signerAddress: String!,
      signedMessage: String!
    ): Organisation!
  }
`
