import { createVNode } from "./createVNode";


export function createAppApi(render) {
  return (rootComponent, rootProps) => {
    let isMounted = false
    const app = {
      mount(container) {
        let vnode = createVNode(rootComponent, rootProps)
        console.log('vnode: ', vnode);
        render()
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