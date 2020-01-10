export default `
  # An icon for an app.
  type AppIcon {
    # The absolute URL to the icon.
    src: String!
    # The size of this icon.
    sizes: String!
  }

  # An Aragon app.
  type App implements Node {
    id: ID!
    # The hash of the app name (also known as the app ID)
    hash: String
    # The address of the app's repository.
    repository: String!
    # The ENS name of this app.
    ens: String

    # The name of this app.
    name: String
    # The author of this app.
    author: String
    # The short description of this app.
    description: String
    # The long-form description of this app.
    details: String
    # The icons of this app.
    icons: [AppIcon]!
    # The source code of the app.
    sourceUrl: String
    # The changelog of the app.
    changelogUrl: String

    # The number of installations of the app.
    installations: Int!

    # The pinion app score of the app, if available.
    score: Int

    # Versions of this app.
    versions: [AppVersion]!
  }

  # An edge in a connection.
  type AppEdge {
    cursor: Cursor!
    node: App
  }

  # The connection type for App.
  type AppConnection {
    edges: [AppEdge]
    nodes: [App]
    pageInfo: PageInfo!
    totalCount: Int!
  }

  # A version of an app.
  type AppVersion implements Node {
    id: ID!
    version: String!
    implementation: String
  }

  input AppConnectionFilter {
    name: StringOperators
    createdAt: DateOperators
    installations: NumberOperators
  }

  input AppConnectionSort {
    id: SortOrder
    name: SortOrder
    installations: SortOrder
    score: SortOrder
  }

  type Query {
    # Look up Aragon apps.
    apps(
      take: Int = 10,
      before: Cursor,
      after: Cursor,
      filter: AppConnectionFilter,
      sort: AppConnectionSort
    ): AppConnection!
  }
`
