import { shallowReadonly } from "../reactive/reactive"
import { initProps } from "./componentProps"
import { publicInstanceProxyHandlers } from "./componentPublicInstance"

export function createComponentInstance(vnode) {
  const component = {
    vnode,
    type:vnode.type,
    setupState:{}, // 保存setup的返回内容
    props:{}
  }
  return component
}
export function setupComponent(instance: { vnode: any }) {
  /* 
    instance{  // 组件实例
      vnode{  // 组件虚拟节点
        type // 传入的App组件配置
      } 
      type // 传入的App组件配置
      props
    }
  */
 initProps(instance,instance.vnode.props)
  // 实例化有状态组件
  setupStatefulComponent(instance)
}

function setupStatefulComponent(instance: any) {
  /* 
    instance{  // 组件实例
      vnode{  // 组件虚拟节点
        type // 传入的App组件配置
      } 
      type // 传入的App组件配置
    }
  */
  const Component = instance.type // 传入的App配置
  // 创建组件代理对象  用于访问this.xxx
  instance.proxy = new Proxy({_:instance},publicInstanceProxyHandlers)
  // 取到App里的setup函数
  const {setup} = Component
  if (setup) {
    const setupResult = setup(shallowReadonly(instance.props)) // 把props传给setup函数
    handleSetupResult(instance,setupResult)
  }
}
function handleSetupResult(instance,setupResult: any) {
  // setup函数有可能返回函数或者对象
  if (typeof(setupResult) === 'object') {
    // 把setup返回的对象保存到实例上
    instance.setupState = setupResult
  }
  finishComponentSetup(instance)
}

function finishComponentSetup(instance: any) {
  const Component = instance.type
  if (Component.render) {
    instance.render =Component.render
  }
}

