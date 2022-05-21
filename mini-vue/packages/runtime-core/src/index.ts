import { createAppApi } from './apiCreateApp'

export * from '@vue/reactivity'

// 与平台无关的运行时

export function createRender(renderOptions) {
  const render = (vnode,container)=>{ //将虚拟节点转化为真实dom并渲染到容器

  }
  return {
    createApp:createAppApi(render),
    render
  }
}