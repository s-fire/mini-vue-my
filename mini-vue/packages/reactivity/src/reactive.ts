import { isObject } from "@vue/shared"
import { track } from "./effect"

const mutableHandles: ProxyHandler<object> = {
  get(target, key, receiver) {
    if (key === ReactiveFlags.IS_REACTIVE) {
      /* 
        如果key === ReactiveFlags.IS_REACTIVE,则表示正在访问对象的get方法
        所以证明该对象已经是被代理过的了，因为如果不是被代理的对象，访问其属性不会
        调用此get方法
      */
      return true
    }
    track(target,key)
    const res = Reflect.get(target, key, receiver)
    return res
  },
  set(target, key, value, receiver) {
    // Reflect.set会返回是否设置成功
    const res = Reflect.set(target, key, value, receiver)
    return res
  }
}
/* 
  解决多次调用reactive得到的值不相等的问题
  const obj = {name:'abc'}
  const state1 = reactive(obj)
  const state2 = reactive(obj)
  console.log(state1 === state2) false;
  创建一个weakMap 保存原始对象和代理后的对象的对应关系
*/

/* 
  解决嵌套调用reactive时返回值不相等的问题
*/
const enum ReactiveFlags {
  IS_REACTIVE = "__v_isReactive"
}
const reactiveMap = new WeakMap()
function createReactiveObject(target: object) {
  if (!isObject(target)) {
    return target
  }
  const exisitingProxy = reactiveMap.get(target)
  if (exisitingProxy) {
    // 表明该对象已经被代理过了，直接返回被代理过的对象
    return exisitingProxy
  }
  /* 
    解决嵌套调用reactive时返回值不相等的问题
    先默认target已经是被代理过的属性
  */
  if (target[ReactiveFlags.IS_REACTIVE]) {
    return target
  }
  const proxyTarget = new Proxy(target, mutableHandles)
  reactiveMap.set(target, proxyTarget)
  return proxyTarget
}

export function reactive(target: object) {
  return createReactiveObject(target)
}