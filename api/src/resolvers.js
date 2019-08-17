import { mergeResolvers } from 'merge-graphql-schemas'
import commonResolver from './common/resolver'
import appsResolver from './apps/resolver'
import orgsResolver from './orgs/resolver'

export default mergeResolvers([
  commonResolver,
  appsResolver,
  orgsResolver
])
