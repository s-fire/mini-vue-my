import { createComponentInstance, setupComponent } from "./component"

export function render(vnode,container) {
  patch(vnode,container)
}
function patch(vnode,container) {
  // 处理组件
  processComponent(vnode,container)
}
// 处理组件
function processComponent(vnode: any, container: any) {
  // 挂载组件
  mountComponent(vnode,container)
}
// 挂载组件
function mountComponent(vnode: any,container) {
  // 创建组件实例
  const instance = createComponentInstance(vnode)
  setupComponent(instance)
  setupRederEffect(instance,container)
}



function setupRederEffect(instance:any,container) {
  const subTree = instance.render()
  // subTree h函数返回的内容
  patch(subTree,container)
}

