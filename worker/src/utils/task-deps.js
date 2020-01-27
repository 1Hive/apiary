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
      try {
        const { status } = await ctx.queue.getJob(depId)

        if (status === 'succeeded') {
          fulfilledDependencies += 1
        }
      } catch (_) {
        // Job did not exist in the queue, so it was already processed
        fulfilledDependencies += 1
      }
    }

    if (fulfilledDependencies === depIds.length) {
      break
    }
  }
}
