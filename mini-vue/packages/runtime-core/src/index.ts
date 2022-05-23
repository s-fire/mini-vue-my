import { reactive } from '@vue/reactivity'
import { ShapeFlags } from '@vue/shared'
import { createAppApi } from './apiCreateApp'

export * from '@vue/reactivity'

// 与平台无关的运行时
/* 
  返回一个创建App函数和渲染函数
*/
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
export function setupStateFulCompon(instance) {
  // 调用组件的setup方法
  const Component = instance.type
  const {setup} = Component
  console.log('setup: ', setup);

}
export function setupComponent(instance) {
  const {props,children} = instance.vnode
  initProps(instance,props)
  setupStateFulCompon(instance) // 调用setup函数  拿到返回值
  console.log(instance);
  
}
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
export function createRender(renderOptions) {
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