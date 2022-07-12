class ReactiveEffect {
  private _fn
  constructor(fn, public scheduler?){
    this._fn = fn
  }
  run(){
    activeEffect = this
    return this._fn()
  }
}
const targetsMap = new Map()
export function track(target,key) {
  let depsMap = targetsMap.get(target)
  if (!depsMap) {
    depsMap = new Map()
    targetsMap.set(target,depsMap)
  }
  let deps = depsMap.get(key)
  if (!deps) {
    deps = new Set()
    depsMap.set(key,deps)
  }
  deps.add(activeEffect)

  // deps.add()
  
}
export function trigger(target,key) {
  let depsMap = targetsMap.get(target)
  if (!depsMap) {
    return
  }
  let deps = depsMap.get(key)
  if (deps) {
    deps.forEach(effect => {
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
  return _effect.run.bind(_effect)
}