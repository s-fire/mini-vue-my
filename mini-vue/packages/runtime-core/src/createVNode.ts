import { isObject, isString, ShapeFlags } from "@vue/shared"

export function createVNode(type, props, children = null) {
  // 判断是否是组件
  const shapeFlags = isObject(type) ?
    ShapeFlags.COMPONENT : isString(type) ?
      ShapeFlags.ELEMENT : 0
  const vnode = {
    __v_isVNode: true,
    type,
    props,
    shapeFlags,
    children, key: props && props.key,
    component: null, //如果是组件的虚拟节点要保存组件的实例
    el: null // 虚拟节点对应的真实节点
  }
  if (children) {
    // 渲染节点的时候 根据children不同的类型进行不同方式的渲染
    // |= 功能与 += 相似
    vnode.shapeFlags |= isString(children) ? ShapeFlags.TEXT_CHILDREN : ShapeFlags.ARRAY_CHILDREN
  }
  return vnode
}