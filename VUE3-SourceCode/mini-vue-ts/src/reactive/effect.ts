class ReactiveEffect {
  private _fn
  constructor(fn){
    this._fn = fn
  }
  run(){
    activeEffect = this
    this._fn()
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
      effect.run()
    });
  }
}
let activeEffect
export function effect(fn){
  const _effect = new ReactiveEffect(fn)
  _effect.run()
}