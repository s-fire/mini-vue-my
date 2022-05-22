import { ShapeFlags } from '@vue/shared'
import { createAppApi } from './apiCreateApp'

export * from '@vue/reactivity'

// 与平台无关的运行时
/* 
  返回一个创建App函数和渲染函数
*/
const mountComponent=(initialVNode,container)=>{

}
const processElement=(n1,n2,container)=>{
  if (n1===null) {
    //组件的初始化
    mountComponent(n2,container)
  }else{
    // 组件更新
  }
}
export function createRender(renderOptions) {
  const patch=(n1,n2,container)=>{
    if (n1===n2) return
    const {shapeFlag} = n2
    if (shapeFlag & ShapeFlags.COMPONENT) {
      processElement(n1,n2,container)
    }
  }
  const render = (vnode,container)=>{ //将虚拟节点转化为真实dom并渲染到容器
    console.log('vnode: ', vnode);
    // 组件渲染   调用path 旧节点传空即可
    patch(null,vnode,container)

  }
  return {
    createApp:createAppApi(render),
    render
  }
}