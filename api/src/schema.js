import { mergeTypes } from 'merge-graphql-schemas'
import commonSchema from './common/schema'
import appsSchema from './apps/schema'
import orgsSchema from './orgs/schema'
import appProxiesSchema from './proxies/schema'

export default mergeTypes([
  commonSchema,
  appsSchema,
  orgsSchema,
  appProxiesSchema
])
