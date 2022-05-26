import { isObject, isString, ShapeFlags } from "@vue/shared"

export function createVNode(type, props, children = null) {
  // 判断是否是组件
  const shapeFlag = isObject(type) ?
    ShapeFlags.COMPONENT : isString(type) ?
      ShapeFlags.ELEMENT : 0
  const vnode = {
    __v_isVNode: true,
    type,
    props,
    shapeFlag,
    children, 
    key: props && props.key,
    component: null, //如果是组件的虚拟节点要保存组件的实例
    el: null // 虚拟节点对应的真实节点
  }
  if (children) {
    // 渲染节点的时候 根据children不同的类型进行不同方式的渲染
    // |= 功能与 += 相似
    vnode.shapeFlag |= isString(children) ? ShapeFlags.TEXT_CHILDREN : ShapeFlags.ARRAY_CHILDREN
  }
  return vnode
}
export function isVNode(vnode) {
  return !!vnode.__v_isVNode
}
export const Text = Symbol()
// 把传过来的字符串转换为vnode
export function normalizeVNode(vnode) {
  if (isObject(vnode)) {
    return vnode
  }
  return createVNode(Text,null,String(vnode))
}