export default `
  # An instance of an app.
  type AppProxy implements Node {
    id: ID!
    # The app ID of this proxy.
    appId: String!
    # The address of the app instance.
    address: String!
    # Information about the app this instance represents.
    app: App
  }

  extend type Organisation {
    # Look up app proxies for this organisation.
    proxies: [AppProxy]!
  }
`
