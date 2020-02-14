import { mergeResolvers } from 'merge-graphql-schemas'
import commonResolver from './common/resolver'
import appsResolver from './apps/resolver'
import orgsResolver from './orgs/resolver'
import appProxiesResolver from './proxies/resolver'

export default mergeResolvers([
  commonResolver,
  appsResolver,
  orgsResolver,
  appProxiesResolver
])
