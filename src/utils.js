export function mapValues(obj, mapper) {
  let result = {}
  Object.keys(obj).forEach(key => { result[key] = mapper(obj[key]) })
  return result
}

export function anyOf(...args) {
  return args.reduce((c, n) => !!c || !!n(), false)
}
