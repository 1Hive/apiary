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
