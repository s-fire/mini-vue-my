
import { ShapeFlags } from '@vue/shared'
import { createAppApi } from './apiCreateApp'
import { createComponentInstance, setupComponent } from './component'

export * from '@vue/reactivity'

// 与平台无关的运行时
/* 
  返回一个创建App函数和渲染函数
*/


export function createRender(renderOptions) {
  const mountComponent=(initialVNode,container)=>{
    // 1. 创建组件实例
    const instance =initialVNode.component = createComponentInstance(initialVNode)
    // 给组件实例赋值
    setupComponent(instance)
  }

  const processElement=(n1,n2,container)=>{
    if (n1===null) {
      //组件的初始化
      mountComponent(n2,container)
    }else{
      // 组件更新
    }
  }
  
  const patch=(n1,n2,container)=>{
    if (n1===n2) return
    const {shapeFlag} = n2
    if (shapeFlag & ShapeFlags.COMPONENT) {
      // 类型是元素
      processElement(n1,n2,container)
    }
  }
  const render = (vnode,container)=>{ //将虚拟节点转化为真实dom并渲染到容器
    // 组件渲染   调用path 旧节点传空即可
    patch(null,vnode,container)

  }
  return {
    createApp:createAppApi(render),
    render
  }
}