import { isTracking, trackEffect, triggerEffect } from "./effect"
import { toReactive } from "./reactive"


class RefImpl{
  public dep
  public __v_isRef
  public _value
  constructor(public _rawValue){
    // 把传入进来的值转换为reactive对象并保存在自身的_value上
    this._value = toReactive(_rawValue)
  }
  // 与计算属性逻辑一致
  get value(){ // 取值的时候进行依赖收集
    if (isTracking()) {
        trackEffect(this.dep || (this.dep = new Set()))
    }
    return this._value
  }
  // 与计算属性逻辑一致
  set value(newValue){ // 设置的时候触发更新
    if (newValue!==this._rawValue) {
      this._rawValue = newValue
      this._value = toReactive(newValue)
    }
    triggerEffect(this.dep)
  }
}

function createRef(rawValue) {
  return new RefImpl(rawValue)
}
export function ref(raw) {
  
}