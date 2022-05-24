export function isObject(value: unknown): value is Record<any, any> {
  return typeof value === 'object' && value !== null
}

export function isFunction(value: any): Boolean {
  return typeof value === 'function'
}
export function  isString(value:any) {
  return typeof(value) === 'string'
}
export const enum ShapeFlags {
  ELEMENT = 1, // 元素
  FUNCTION_COMPONENT = 1 << 1, //函数式组件
  STATEFUL_COMPONENT = 1 << 2, // 普通组件
  TEXT_CHILDREN = 1 << 3,        // 孩子是文本
  ARRAY_CHILDREN = 1 << 4,       // 孩子是数组
  SLOTS_CHILDREN = 1 << 5,      // 组件插槽
  TELEPORT = 1 << 6,           // teleport
  SUSPENSE = 1 << 7,           //suspense组件
  COMPONENT = ShapeFlags.STATEFUL_COMPONENT | ShapeFlags.FUNCTION_COMPONENT // 组件

}
const hasOwnPropetry = Object.prototype.hasOwnProperty
export const hasOwn = (value,key)=> hasOwnPropetry.call(value,key)