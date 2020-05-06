export function transformStringFilter (op) {
  if (op.eq) {
    return { $eq: op.eq }
  }

  if (op.contains) {
    return { $regex: op.contains }
  }

  if (op.in) {
    return { $in: op.in }
  }

  return {}
}

export function transformDateFilter (op) {
  if (op.eq) {
    return { $eq: op.eq }
  }

  if (op.before) {
    return { $lt: op.before }
  }

  if (op.after) {
    return { $gt: op.after }
  }

  if (op.between) {
    return { $gt: op.between.start, $lt: op.between.end }
  }

  return {}
}

export function transformNumberFilter (op) {
  if ('eq' in op) {
    return { $eq: op.eq }
  }

  if ('lt' in op) {
    return { $lt: op.lt }
  }

  if ('lte' in op) {
    return { $lte: op.lte }
  }

  if ('gt' in op) {
    return { $gt: op.gt }
  }

  if ('gte' in op) {
    return { $gte: op.gte }
  }

  if (op.between && 'start' in op.between && 'end' in op.between) {
    return { $gt: op.between.start, $lt: op.between.end }
  }

  return {}
}

export function transformBooleanFilter (op) {
  return {
    $exists: op
  }
}
