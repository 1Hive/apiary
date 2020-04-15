import { promisify } from 'util'

export default async function ensureDeps (
  ctx,
  depIds
) {
  // There are no dependencies, so they are already fulfilled
  if (depIds.length === 0) {
    return
  }

  // Wait until all jobs we are dependent on are done
  while (true) {
    let fulfilledDependencies = 0
    for (const depId of depIds) {
      const isCompleted = await promisify(
        ctx.cache.client.sismember
      ).bind(
        ctx.cache.client
      )(
        'completed',
        depId
      )

      if (isCompleted) {
        fulfilledDependencies += 1
      }
    }

    if (fulfilledDependencies === depIds.length) {
      break
    }
  }
}
