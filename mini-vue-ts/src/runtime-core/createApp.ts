import { render } from "./render"
import { createVnode } from "./vnode"

export function createApp(rootComponent){
  // 传入的App配置
  return {
    mount(rootContainer){
      // 转换成虚拟节点
      // component -> vnode
      const vnode = createVnode(rootComponent)
      render(vnode,rootContainer)
    }
  }
}
