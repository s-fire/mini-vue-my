import { isObject } from "@vue/shared";
import { createVNode, isVNode } from "./createVNode";

export function h(type,propsOrchildren,children) {
  // h函数的目的是调用createVNode方法创建虚拟节点并返回‘
  /* 
    h函数可能的写法
    两个参数
    1. h('div',{color:red})
    2. h('div',h('span'))
    3. h('div','hello')
    4. h('div',['hello','hello'])
    三个参数
    4. h('div',{},children)
    5. h('div',{},[children,children,children]
  */
 // 根据参数长度来实现不同的逻辑
  let l = arguments.length
  if (l === 2) {
    if (isObject(propsOrchildren) && !Array.isArray(propsOrchildren)) {
      // 只有两个参数 且第二个参数是一个对象
      if (isVNode(propsOrchildren)) {
        // 第二个参数是一个虚拟节点
        return createVNode(type,null,[propsOrchildren])
      }
      // 第二个参数是对象
      return createVNode(type,propsOrchildren)
    }else{
      // 第二个参数是字符串或者数组
      return createVNode(type,null,propsOrchildren)
    }
  }else{
    if (l > 3) {
      // 除了前两个参数后面的都是children
      children = Array.prototype.slice.call(arguments,2)
    }else if (l ===3 && isVNode(children)) {
      children = [children]
    }
    return createVNode(type,propsOrchildren,children)
  }
}