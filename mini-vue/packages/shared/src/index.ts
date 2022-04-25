export function isObject(value:unknown):value is Record<any,any> {
  return typeof value === 'object' && value !== null 
}

export function isFunction(value:any):Boolean {
  return typeof value === 'function'
}