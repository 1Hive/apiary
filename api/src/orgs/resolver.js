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
