import { createVNode } from "./createVNode";


export function createAppApi(render) {
  return (rootComponent, rootProps) => {
    let isMounted = false
    const app = {
      mount(container) {
        // 1.创造组件虚拟节点
        let vnode = createVNode(rootComponent, rootProps)
        // 2.将虚拟节点渲染到容器中
        render(vnode,container)
        if (!isMounted) {
          isMounted = true
        }
      },
      // use(){

      // },
      // mixin(){

      // },
      // component(){

      // }
    }
    return app
  }
}