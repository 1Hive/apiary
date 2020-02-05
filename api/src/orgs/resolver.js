import { getOrganisations } from './data'

export default {
  Query: {
    organisations (_, args, { db }) {
      return getOrganisations(
        db,
        args
      )
    }
  },

  Organisation: {
    id (org) {
      return org._id
    },
    score (org) {
      return org.score || 0
    },
    aum (org) {
      return org.aum || 0
    },
    activity (org) {
      return org.activity || 0
    },
    createdAt (org) {
      return org.created_at
    }
  },

  OrganisationConnection: {
    edges (parent) {
      return parent.documents
    },
    nodes (parent) {
      return parent.documents
    }
  },

  OrganisationEdge: {
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
