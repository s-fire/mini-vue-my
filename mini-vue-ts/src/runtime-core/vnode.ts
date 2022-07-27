import { ShapeFlags } from "../shared/ShapeFlags";

export function createVnode(type, props?, children?) {
  // type传入的App配置
  const vnode = {
    type,
    props,
    children,
    shapeFlag: getShapeFlage(type),
    el: null, // 保存当前的el dom
  };
  // children  这里可以理解为  | 运算 后的结果同时保留了原本的shapeFlag和children的shapeFlage
  if (typeof children === "string") {
    vnode.shapeFlag = vnode.shapeFlag | ShapeFlags.TEXT_CHILDREN;
  }else if (Array.isArray(children)) {
    vnode.shapeFlag = vnode.shapeFlag | ShapeFlags.ARRAY_CHILDREN
  }
  return vnode;
}
// 设置vnode对应的shapeFlag
/* 
  位运算  | 运算时 有 1 得1  & 运算时  全是1才得1  
*/
function getShapeFlage(type: any) {
  return typeof type === "string"
    ? ShapeFlags.ELEMENT
    : ShapeFlags.STATEFUL_COMPONENT;
}
/* 
  0001
  0100
  0101
  1000
*/
