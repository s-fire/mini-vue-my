import { isFunction } from "@vue/shared";
import { isTracking, ReactiveEffect, trackEffect, triggerEffect } from "./effect";

class ComputedRefImpl{
  public dep
  public _dirty = true
  public __v_isRef = true
  public effect
  public _value: void
  constructor(getter:any,public setter:any){
    // 将计算属性包成一个effect,计算属性中的属性会收集这个effect
    // 需要effect实现scheduler功能
    this.effect = new ReactiveEffect(getter,()=>{
      // 计算属性依赖的属性值变了，由于scheduler,所以不执行计算属性依赖的effect，而是执行此代码
      // 把_dirty的值改为false,并收集此时依赖的effect,在下次访问计算属性的值得时候，会重新触发run 方法取到新值
      if (!this._dirty) {
        this._dirty=true
        triggerEffect(this.dep)
      }
    })
  }
  get value(){ // 取值时会走get方法
    if (isTracking()) { // 是否是在effect中访问computed的value
      trackEffect(this.dep || (this.dep= new Set()))
    }
    if (this._dirty) {
      // 缓存计算结果，下次取值的时候不再触发run
      this._value= this.effect.run()
      this._dirty = false
    }
    return this._value
  }
  set value(newValue){
    this.setter(newValue) //修改计算属性的值触发传入的set方法
  }
}

export function computed(getterOrOptions:any) {
  // computed里面可能是一个函数，也可能是一个对象
  const onlyGetter = isFunction(getterOrOptions)
  let getter
  let setter
  if (onlyGetter) {
    // 传入的是函数
    getter=getterOrOptions
    setter = ()=>{}
  }else{
    // 传入的是对象
    getter = getterOrOptions.get
    setter = getterOrOptions.set
  }
  return new ComputedRefImpl(getter,setter)
}