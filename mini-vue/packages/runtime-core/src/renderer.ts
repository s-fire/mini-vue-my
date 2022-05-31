
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
    // children 是一个数组
    for (let i = 0; i < children.length; i++) {
      // 此时children[i] 是单个的字符串 将其转换为对象
      const child = (children[i] = normalizeVNode(children[i]));
      // 将得到的虚拟节点渲染
      patch(null,child,container)
    }

  }
  const mountElement = (vnode,container,anchor=null)=>{
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
    hostInsert(el,container,anchor)
  }
  const patchProps=(oldProps,newProps,el)=>{
    if (oldProps === newProps) return
    for (const key in newProps) {
      const next = newProps[key];
        const prev = oldProps[key]
        if (prev !== next) {
          hostPathProps(el,key,prev,next)
        }
    }
    for (const key in oldProps) {
      if (!(key in newProps)) {
        hostPathProps(el,key,oldProps[key],null)
      }
    }
  }
  const unmountChildren=(children)=>{
    // 循环删除children
    for (let index = 0; index < children.length; index++) {
      unmount(children[index])
    }
  }
  const patchKeyedChildren=(c1,c2,container)=>{
    let e1 = c1.length-1 // 老数组的长度
    let e2 = c2.length-1 // 新数组的长度
    let i =0
    //1 sync from start 从头开始一个个比(前面的部分元素是一样的)
    while (i <= e1 && i<=e2) {
      // 找到其中较短的数组的最后一项
      const n1 = c1[i]
      const n2 = c2[i]
      if (isSameVNodeType(n1,n2)) {
        // 如果两个节点是相同节点 则调用Patch
        patch(n1,n2,container)
      }else{
        break
      }
      i++
    }
    //2 sync from end 从尾部开始一个个比(后面的部分元素是一样的)
    console.log(i);
    
    while (i <= e1 && i<=e2) {
      // 找到其中较短的数组的最后一项
      const n1 = c1[e1]
      const n2 = c2[e2]
      if (isSameVNodeType(n1,n2)) {
        // 如果两个节点是相同节点 则调用Patch
        patch(n1,n2,container)
      }else{
        break
      }
      // 此时是从尾部开始比较的 所以i不需要++ 而是c1和c2的长度最后一个元素的指针需要--
      e1--
      e2--
    }
    // console.log(e1,e2,i); // 0 1 0
    // 以上两步可以确定好头部和尾部相同的节点 从而可以找出除了头部和尾部之外的不同节点
    // 3. common seqence + mount 正常序列挂载
    if (i>e1) { // 如果i>e1 则说明有新增的元素
      if (i<=e2) { // i和e2之间的内容就是新增的
        // 处理新增元素时新增的位置
        const nextPos = e2 +1 // 给新数组的最后一位指针 +1
        // 如果下一个指针比新数组长度小 (这种情况是从后面往前比较的e2是上面通过--得来的) 则证明是需要在前面追加元素，取出下一个节点作为参照物
        // 否则就是需要在最尾部追加 (这种情况是从前面后面比较的e2就是新数组最后元素的指针) 不需要传参照物(默认参照物是container)
        const anchor = nextPos < c2.length ? c2[nextPos].el : null
        while (i<=e2) {
          patch(null,c2[i],container,anchor)
          i++
        }
      } 
    }
    // 3. common seqence + unmount 正常序列卸载
    else if (i>e2) {
      // 老的比新的多 删除i和e1之间的元素
      while (i<=e1) {
        unmount(c1[i])
        i++
      }

    }
    // unknow seqence 无规律
    const s1 = i  //s1 -> e1 比较完前后之后中间不同的元素
    const s2 = i  //s2 -> e2 比较完前后之后中间不同的元素
    /* 
      根据新的节点数组中不同的元素创建一个映射表
      拿老的节点去表里找 有则复用  没有则添加
    */
   const keyToNewIndexMap = new Map()
   for (let i = s2; i <= e2; i++) {
     const child = c2[i]
     keyToNewIndexMap.set(child.key,i)
   }
   /* 
      创建一个数组 长度为新节点数组中不同部分的元素个数
   */
  // 算出数组长度
  const toBePatched = e2 - s2 +1
  const newIndexToOldMapIndex = new Array(toBePatched).fill(0)
  for (let i = s1; i <= e1; i++) {
    const preChild = c1[i]; // 拿到老的每一个节点
    let newIndex = keyToNewIndexMap.get(preChild.key)
    if (newIndex === undefined) {
      // 老的元素在新的数组里没有 则删除
      unmount(preChild)
    }else{
     /*  newIndex是该元素在整个新数组里的下标，需要减去前面相同部分的长度
      才能得到 在 newIndexToOldMapIndex 里的真实位置 ，然后把这个位置的
      对应的元素(本来是0)改成老数组中该元素的下标
      */
      newIndexToOldMapIndex[newIndex - s2] = i + 1 
      // +1确保当i=0的时候覆盖数组内元素内容的时候不会还是为O 因为如果为O代表该位置的元素没有被覆盖，则说明这个元素是要新增的
      // 比较两个节点
      patch(preChild,c2[newIndex],container)
    }
  }
  // 倒序插入元素
  for(let i = toBePatched -1; i>=0; i--){
    console.log(s2+i);
    
    let lastIndex = s2 + i  // newIndexToOldMapIndex 最后一个元素在c2里对应位置
    let lastChild = c2[lastIndex]
    // 判断lastIndex是否是c2的最后一个元素 不是的话取下一位元素做参照位置
    let anchor = lastIndex + 1 < c2.length ? c2[lastIndex + 1].el : null
    if (newIndexToOldMapIndex[i] === 0) {
      // 当前位置的元素值没有被修改过，则证明该元素是新增的
      patch(null,lastChild,container,anchor)
    }else{
      // 此时lastChild会逐步往前推
      hostInsert(lastChild.el,container,anchor) // 依次倒序插入元素
    }
  }
  }
  const patchChldren =(n1,n2,el)=>{
    // 老的children
    const c1 = n1 && n1.children
    // 新的children
    const c2 = n2 && n2.children
    const prevShapeFlag = n1.shapeFlag
    const shapeFlag = n2.shapeFlag
    /* 
      c1、c2可能的类型
      1. 现在是文本 之前是数组  删除老的节点  用新的文本替换
      2. 现在是文本 之前也是文本 直接更新文本
      3. 现在是文本 之前是空  直接设置
      4. 现在是空 之前是文本  直接删除老的即可
      5. 现在是数组 之前是数组  比较两个数组的差异
      6. 现在是数组 之前是文本 删除文本 新增children
    */
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      // 当前是文本
      if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        //之前是数组
        unmountChildren(c1)
      }
      if (c1 !==c2) {
        // 之前是文本
        hostSetElementText(el,c2) // 1、2、3
      }
    }else{
      // 当前是数组
      if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
          // 新老都是数组 对比两个数组的差异
          patchKeyedChildren(c1,c2,el)
        }else{
          // 之前的数组  现在不是数组(空文本)
          unmountChildren(c1) // 4
        }
      } else {
        // 之前是文本
        if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
          // 先清空之前的的文本
          hostSetElementText(el,'')
        }
        if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
          // 当前是数组
          mountChildren(c2,el)
        }
      }
    }
  }
  const patchElement=(n1,n2)=>{
    // 此时n1 和 n2是同一个节点 只是props不同
    let el = n2.el = n1.el  // 先比较元素  元素一致 则复用
    const oldProps = n1.props || {} // 复用后比较属性
    const newProps = n2.props || {}
    patchProps(oldProps,newProps,el)
    // 儿子比较
    patchChldren(n1,n2,el)
  }
  const processElement=(n1,n2,container,anchor=null)=>{
    if (n1===null) {
      // 初始化
      mountElement(n2,container,anchor)
    }else{
      // 更新
      patchElement(n1,n2)
    }
  }
  const processText= (n1,n2,container)=>{
    if (n1 === null) {
     let textNode= hostCreateText(n2.children)
     n2.el = textNode // 让虚拟接待和真实节点挂载上
     hostInsert(textNode,container)
    }
  }
  const unmount = (vnode) =>{
    hostRemove(vnode.el)
  }
  const patch=(n1,n2,container,anchor = null)=>{
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
          processElement(n1,n2,container,anchor)
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