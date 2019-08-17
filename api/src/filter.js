export function transformStringFilter (op) {
  if (op.eq) {
    return { $eq: op.eq }
  }

  if (op.contains) {
    return { $regex: op.contains }
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
