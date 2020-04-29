import { getOrganisations, getSingleOrganisation, updateProfile } from './data'

const EMPTY_PROFILE = {
  name: '',
  description: '',
  icon: '',
  links: []
}

export default {
  Query: {
    organisations (_, args, { db }) {
      return getOrganisations(
        db,
        args
      )
    },

    organisation (_, args, { db }) {
      return getSingleOrganisation(
        db,
        args
      )
    }
  },

  Mutation: {
    updateProfile (_, args, { db }) {
      return updateProfile(
        db, args
      )
    }
  },

  Profile: {
    name (profile) {
      return profile.name || ''
    },
    icon (profile) {
      return profile.icon || ''
    },
    links (profile) {
      return profile.links || []
    },
    editors (profile) {
      return profile.editors || []
    },
    description (profile) {
      return profile.description || ''
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
    ant (org) {
      return org.ant || 0
    },
    activity (org) {
      return org.activity || 0
    },
    profile (org) {
      return org.profile || EMPTY_PROFILE
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
