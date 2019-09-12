import { getApps } from './data'

export default {
  Query: {
    apps (_, args, { db }) {
      return getApps(
        db,
        args
      )
    }
  },

  App: {
    id (app) {
      return app._id
    },
    sourceUrl (app) {
      return app.source_url
    },
    changelogUrl (app) {
      return app.changelog_url
    },
    installations (app) {
      return app.installations || 0
    }
  },

  AppConnection: {
    edges (parent) {
      return parent.documents
    },
    nodes (parent) {
      return parent.documents
    }
  },

  AppEdge: {
    cursor (parent) {
      return {
        value: parent._id.toString()
      }
    },
    node (parent) {
      return parent
    }
  }
}
