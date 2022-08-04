import { shallowReadonly } from "../reactive/reactive"
import { emit } from "./componentEmits"
import { initProps } from "./componentProps"
import { publicInstanceProxyHandlers } from "./componentPublicInstance"

export function createComponentInstance(vnode) {
  const component = {
    vnode,
    type:vnode.type,
    setupState:{}, // 保存setup的返回内容
    props:{},
    emit:()=>{}
  }
  component.emit = emit.bind(null,component) as any  // bind解决调用emit时只需要传入事件名，不需要再传instance
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
    setCurrentInstance(instance)
    const setupResult = setup(shallowReadonly(instance.props),{
      emit:instance.emit
    }) // 把props传给setup函数
    setCurrentInstance(null)
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
let currentInstance = null
export function getCurrentInstance() {
  return currentInstance  
}

export function setCurrentInstance(instance) {
  currentInstance = instance
}

