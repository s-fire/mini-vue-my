
import { ReactiveEffect } from '@vue/reactivity'
import { ShapeFlags } from '@vue/shared'
import { createAppApi } from './apiCreateApp'
import { createComponentInstance, setupComponent } from './component'
export {h} from './h'
export * from '@vue/reactivity'

// 与平台无关的运行时
/* 
  返回一个创建App函数和渲染函数
*/


export function createRender(renderOptions) {
  const setupRenderEffect = (initialVNode,instance,container)=>{
    // 创建渲染effect
    //组件更新方法 核心就是调用render 数据变化就重新调用render
    const componentUpdateFn=()=>{
      let {proxy} = instance
      if (!instance.isMounted) {
        // 组件初始化流程
        // render方法会返回虚拟节点 渲染页面的时候会进行取值操作，进行依赖收集，收集对应的effect
        const subTree =  instance.subTree = instance.render.call(proxy,proxy)
        console.log('subTree: ', subTree);
        instance.isMounted=true
      }else{
        // 组件更新的流程
      }
    }
    // 页面初始化的effect函数 在此函数内进行依赖收集
    const effect = new ReactiveEffect(componentUpdateFn)
    const update = effect.run.bind(effect)
    // 默认调用update方法 就会执行componentUpdateFn
    update()
  }
  const mountComponent=(initialVNode,container)=>{
    // 1. 创建组件实例
    const instance =initialVNode.component = createComponentInstance(initialVNode)
    // 2. 给组件实例赋值
    setupComponent(instance)
    // 3. 调用render方法 实现组件渲染逻辑如果依赖发生变化 组件重新渲染
    setupRenderEffect(initialVNode,instance,container)
  }

  const processElement=(n1,n2,container)=>{
    if (n1===null) {
      //组件的初始化
      mountComponent(n2,container)
    }else{
      // 组件更新
    }
  }
  
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