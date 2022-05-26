
import { ReactiveEffect } from '@vue/reactivity'
import { ShapeFlags } from '@vue/shared'
import { createAppApi } from './apiCreateApp'
import { createComponentInstance, setupComponent } from './component'
import { isSameVNodeType, normalizeVNode, Text } from './createVNode'
// 与平台无关的运行时
/* 
  返回一个创建App函数和渲染函数
*/


export function createRender(renderOptions) {
  // 取出renderOptions里面的方法并重命名
  const {
    insert:hostInsert,
    remove:hostRemove,
    patchProps:hostPathProps,
    createElement:hostCreateElement,
    createText:hostCreateText,
    createComment:hostCreateComment,
    setText:hostSetText,
    setElementText:hostSetElementText,
    parentNode:hostParentNode,
    nextSibling:hostNextSibling,
  } = renderOptions
  
  const setupRenderEffect = (initialVNode,instance,container)=>{
    // 创建渲染effect
    //组件更新方法 核心就是调用render 数据变化就重新调用render
    const componentUpdateFn=()=>{
      let {proxy} = instance
      if (!instance.isMounted) {
        // 组件初始化流程
        // render方法会返回虚拟节点 渲染页面的时候会进行取值操作，进行依赖收集，收集对应的effect
        const subTree =  instance.subTree = instance.render.call(proxy,proxy)
        // 真正渲染组件 应该渲染的是subTree
        patch(null,subTree,container)
        // 渲染完成后会生成真实节点挂到subTree上
        initialVNode.el = subTree.el
        instance.isMounted=true
      }else{
        // 组件更新的流程
        const prevTree = instance.subTree
        const nextTree = instance.render.call(proxy,proxy)
        patch(prevTree,nextTree,container)
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

  const processComponent=(n1,n2,container)=>{
    if (n1===null) {
      //组件的初始化
      mountComponent(n2,container)
    }else{
      // 组件更新
    }
  }
  const mountChildren = (children,container)=>{
    console.log('children: ', children);
    // children 是一个数组
    for (let i = 0; i < children.length; i++) {
      // 此时children[i] 是单个的字符串 将其转换为对象
      const child = (children[i] = normalizeVNode(children[i]));
      // 将得到的虚拟节点渲染
      patch(null,child,container)
    }

  }
  const mountElement = (vnode,container)=>{
    let {type,props,shapeFlag,children} = vnode // 获取节点的类型、属性、children
    // 创建节点
    let el=vnode.el= hostCreateElement(type)
    // 处理children
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      // 文本children
      hostSetElementText(el,children)
    }else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      // children是数组
      mountChildren(children,el)
    }
    // 处理属性
    if (props) {
      for (const key in props) {
        if (Object.prototype.hasOwnProperty.call(props, key)) {
          const element = props[key];
          hostPathProps(el,key,null,element)
        }
      }
    }
    
    // 插入容器
    hostInsert(el,container)
  }
  const patchProps=(oldProps,newProps,el)=>{
    if (oldProps === newProps) return
    for (const key in newProps) {
      if (Object.prototype.hasOwnProperty.call(newProps, key)) {
        const next = newProps[key];
        const prev = oldProps[key]
        if (prev !== next) {
          hostPathProps(el,key,prev,next)
        }
      }
    }
    for (const key in oldProps) {
      if (!(key in newProps)) {
        hostPathProps(el,key,oldProps[key],null)
      }
    }
  }
  const patchElement=(n1,n2)=>{
    // 此时n1 和 n2是同一个节点 只是props不同
    let el = n2.el = n1.el  // 先比较元素  元素一致 则复用
    const oldProps = n1.props || {} // 复用后比较属性
    const newProps = n2.props || {}
    patchProps(oldProps,newProps,el)
  }
  const processElement=(n1,n2,container)=>{
    if (n1===null) {
      // 初始化
      mountElement(n2,container)
    }else{
      // 更新
      patchElement(n1,n2)
    }
  }
  const processText= (n1,n2,container)=>{
    if (n1 === null) {
     let textNode= hostCreateText(n2.children)
     hostInsert(textNode,container)
    }
  }
  const unmount = (vnode) =>{
    hostRemove(vnode.el)
  }
  const patch=(n1,n2,container)=>{
    if (n1 && !isSameVNodeType(n1,n2)) {
      unmount(n1)
      n1=null
    }
    
    if (n1===n2) return
    const {shapeFlag,type} = n2
    switch (type) {
      case Text:
        // 是文本节点
        processText(n1,n2,container)
        break;
    
      default:
        if (shapeFlag & ShapeFlags.COMPONENT) {
          // 类型是组件
          processComponent(n1,n2,container)
        }else if (shapeFlag && ShapeFlags.ELEMENT) {
          // 类型是元素
          processElement(n1,n2,container)
        }
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