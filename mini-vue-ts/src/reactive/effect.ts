let activeEffect;
let shouldTrack; //实收收集当前effect所存在的dep依赖，在实现stop的时候需要用到
class ReactiveEffect {
  private _fn: any;
  // 收集当前effect被哪些dep所收集
  deps = [];
  active = true; // 避免多次调用stop时 重复清理effect
  onStop?: () => void;
  constructor(fn, public scheduler?) {
    this._fn = fn;
  }
  run() {
    if (!this.active) {
      // 当前是调用了stop方法的情况
      return this._fn();
    }
    shouldTrack = true;
    activeEffect = this;
    const result = this._fn();
    shouldTrack = false;
    return result;
  }
  stop() {
    if (this.active) {
      cleanUpEffect(this);
      this.active = false;
      if (this.onStop) {
        this.onStop();
      }
    }
  }
}
function cleanUpEffect(effect) {
  // 循环收集到的当前effect所存在的所有dep 将当前effect从其中删除
  effect.deps.forEach((dep: any) => {
    dep.delete(effect);
  });
}
export function isTracking() {
  return shouldTrack && activeEffect !== undefined;
}
const targetsMap = new Map();
export function trackEffects(dep) {
  // 将dep添加到当前effect的deps里,用于调用stop时删除当前的effect
  if (dep.has(activeEffect)) return;
  dep.add(activeEffect);
  activeEffect.deps.push(dep);
}
export function track(target, key) {
  if (!isTracking()) return;
  let depsMap = targetsMap.get(target);
  if (!depsMap) {
    depsMap = new Map();
    targetsMap.set(target, depsMap);
  }
  let dep = depsMap.get(key);
  if (!dep) {
    dep = new Set();
    depsMap.set(key, dep);
  }
  trackEffects(dep);
}
export function triggerEffects(dep) {
  dep.forEach((effect) => {
    if (effect.scheduler) {
      effect.scheduler();
    } else {
      effect.run();
    }
  });
}
export function trigger(target, key) {
  let depsMap = targetsMap.get(target);
  if (!depsMap) {
    return;
  }
  let dep = depsMap.get(key);
  if (dep) {
    triggerEffects(dep);
  }
}
export function effect(fn, options: any = {}) {
  const scheduler = options.scheduler;
  const _effect = new ReactiveEffect(fn, scheduler);
  Object.assign(_effect, options);
  _effect.run();
  const runner: any = _effect.run.bind(_effect);
  // 给返回的runner挂载effect属性 用于在调用stop方法时调用到实例上的stop方法
  runner.effect = _effect;
  return runner;
}
export function stop(runner: any) {
  runner.effect.stop();
}
