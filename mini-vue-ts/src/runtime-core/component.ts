export function createComponentInstance(vnode) {
  const component = {
    vnode,
    type:vnode.type
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
    }
  */
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
  // 取到App里的setup函数
  const {setup} = Component
  if (setup) {
    const setupResult = setup()
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

