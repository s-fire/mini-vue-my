import { reactive } from "@vue/reactivity"
import { isFunction, isObject } from "@vue/shared"

export function createComponentInstance(vnode) {
  const type = vnode.type
  const instance = {
    vnode, // 实例对应的虚拟节点
    type, // 组件对象
    subTree:null, // 组件渲染的内容
    ctx:{}, // 组件上下文
    props:{}, // 组件属性
    attrs:{}, // 除了props中的属性
    slots:{}, // 组件插槽
    setupState:{}, // setup返回的状态
    propsOptions:type.props, // 属性选项
    proxy:null, // 实例的代理对象
    render:null,  // 组件的渲染函数
    emit:null,  //  事件触发
    exposed:{}, // 暴露的方法
    isMounted:false // 是否挂载
  }
  instance.ctx ={_:instance}
  return instance
}
export function initProps(instance,rawProps) {
  const props = {}
  const attrs = {}
  const options = Object.keys(instance.propsOptions)
  if (rawProps) {
    for (const key in rawProps) {
      if (Object.prototype.hasOwnProperty.call(rawProps, key)) {
        const element = rawProps[key];
        if (options.includes(key)) {
          props[key]=element
        }else{
          attrs[key] = element
        }
      }
    }
  }
  instance.props = reactive(props)
  instance.attrs = attrs
}
function createSetupComponent(instance) {
  // 创建组件上下文  也就是setup方法里的第二个参数 ctx
  return {
    attrs:instance.attrs,
    solts:instance.slots,
    emit:instance.emit,
    expose:(exposed)=> instance.exposed = exposed || {}
  }
}
export function setupStateFulCompon(instance) {
  // 调用组件的setup方法
  const Component = instance.type
  const {setup} = Component
  if (setup) {
    const setupContext = createSetupComponent(instance)
    // 获取setup的返回值
    let setupResult=setup(instance.props,setupContext)
    if (isFunction(setupResult)) {
      instance.render = setupResult // 如果setup返回的是函数name就是render函数
    }else if (isObject(setupResult)) {
      instance.setupState=setupResult
    }
  }
  if (!instance.render) {
    // 没有render 是手写render 需要做模板编译
    instance.render = Component.render
  }
  console.log('instance: ', instance);

}
export function setupComponent(instance) {
  const {props,children} = instance.vnode
  initProps(instance,props)
  setupStateFulCompon(instance) // 调用setup函数  拿到返回值
}