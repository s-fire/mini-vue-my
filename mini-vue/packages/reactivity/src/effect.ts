// 解决effect里面嵌套effect时，effect引用错误的问题
let effectStack: Array<any> = []
let activeEffect: ReactiveEffect | undefined
function cleanupEffect(effect:ReactiveEffect) {
  // 把当前的effect从其依赖的所有属性的dep里面删掉
  const {deps} = effect
  for (const dep of deps) {
    dep.delete(effect)
  }
}
class ReactiveEffect {
  constructor(public fn: () => void) { }
  active = true
  deps:Array<any> = [] // 记录当前effect依赖了哪些属性,同时也可以记录当前属性依赖了哪些effect
  run(): void {
    if (!this.active) {
      return this.fn()
    }
    if (!effectStack.includes(this)) {
      //解决同一个effect会多次执行,例如在effect把响应式对象的值设置为随机数，如果不做这个判断会无线循环调用effect
      try {
        effectStack.push(activeEffect = this as any) // 将当前effect推入栈中
        this.fn()
      } finally {
        effectStack.pop()
        /* 
          当前effect执行完成之后，当前effect的依赖收集结束,从栈中删掉当前的effect
          如果是effect嵌套调用的情况，会先从最里面的effect开始往外删除
        */
        activeEffect = effectStack[effectStack.length - 1] //此时effectStack的最后一个是当前执行完毕的effect的上层effect
      }
    }
  }
  stop():void{
     if (this.active) {
        cleanupEffect(this)
        this.active=false       
     }
  }
}
// 判断当前effect是否需要收集
export function isTracking() {
  return activeEffect !== undefined
}
const targetsMap = new WeakMap()
// track目标：找到当前key的dep，并将当前的activeEffect添加到里面
export function track(target: object, key: string | symbol) {
  if (!isTracking()) {
    // 不是在effetc里访问响应式对象的值,所以不需要追踪
    return
  }
  let depsMap = targetsMap.get(target)
  if (!depsMap) {
    targetsMap.set(target,(depsMap = new Map()))
  }
  let dep = depsMap.get(key)
  if (!dep) {
    dep = new Set()
    depsMap.set(key,dep)
  }
  // 判断dep里是否已经存在当前的effect
  let shouldTrack = !dep.has(activeEffect)
  if (shouldTrack) {
    dep.add(activeEffect)
    // 记录当前effeft依赖了哪些属性,这是保存在effect实例上的属性，在实现stop功能的时候需要访问这个deps
    activeEffect?.deps.push(dep) 
  }

}

export function trigger(target: object, key: string | symbol) {
  const depsMap = targetsMap.get(target)
  if (!depsMap) {
    // 说明修改的属性没有依赖任何的effect
    return
  }
  // let deps = []
  // if (key!==undefined) {
  //   deps.push(depsMap.get(key))
  // }
  // let effects = []
  // for (const dep of deps) {
  //   effects.push(...dep)
  // }
  // for (const effect of effects) {
  //   effect.run()
  // }
  const deps = depsMap.get(key)
  deps.forEach((effect: { run: () => void }) => {
    effect.run()
  });
}
export function effect(fn: () => void) {
  const _effect = new ReactiveEffect(fn)
  _effect.run()
  let runner:any = _effect.run.bind(_effect) //返回当前effect的run  使用的时候可以接受这个返回值再次调用触发
  runner.effect = _effect  // 给runner添加一个effect属性，用来调用stop方法
  return runner
}