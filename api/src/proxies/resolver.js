import { getAppByAppId } from '../apps/data'

export default {
  Organisation: {
    proxies (organisation) {
      return organisation.apps
    }
  },

  AppProxy: {
    id (proxy) {
      return proxy.address
    },
    appId (proxy) {
      return proxy.id
    },
    app (proxy, _, { db }) {
      return getAppByAppId(db, proxy.id)
    }
  }
}
