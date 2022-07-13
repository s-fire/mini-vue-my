class ReactiveEffect {
  private _fn:any
  // 收集当前effect被哪些dep所收集
  deps=[]
  active= true // 避免多次调用stop时 重复清理effect
  constructor(fn, public scheduler?){
    this._fn = fn
  }
  run(){
    activeEffect = this
    return this._fn()
  }
  stop(){
    if (this.active) {
      cleanUpEffect(this)
      this.active = false
    }
  }
}
function cleanUpEffect(effect) {
  // 循环收集到的当前effect所存在的所有dep 将当前effect从其中删除
  effect.deps.forEach((dep:any)=>{
    dep.delete(effect)
})
}
const targetsMap = new Map()
export function track(target,key) {
  let depsMap = targetsMap.get(target)
  if (!depsMap) {
    depsMap = new Map()
    targetsMap.set(target,depsMap)
  }
  let dep = depsMap.get(key)
  if (!dep) {
    dep = new Set()
    depsMap.set(key,dep)
  }
  dep.add(activeEffect)
  // 将dep添加到当前effect的deps里,用于调用stop时删除当前的effect
  activeEffect.deps.push(dep)  
}
export function trigger(target,key) {
  let depsMap = targetsMap.get(target)
  if (!depsMap) {
    return
  }
  let dep = depsMap.get(key)
  if (dep) {
    dep.forEach(effect => {
      if (effect.scheduler) {
        effect.scheduler()
      }else{
        effect.run()
      }
    });
  }
}
let activeEffect
export function effect(fn,options:any={}){
  const scheduler = options.scheduler
  const _effect = new ReactiveEffect(fn,scheduler)
  _effect.run()
  const runner:any =  _effect.run.bind(_effect)
  // 给返回的runner挂载effect属性 用于在调用stop方法时调用到实例上的stop方法
  runner.effect = _effect
  return runner
}
export function stop(runner:any) {
  runner.effect.stop()
}