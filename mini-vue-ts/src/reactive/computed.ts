import { ReactiveEffect } from "./effect";
import { ref } from "./ref";
class ComputedRefImpl{
  private _dirty: boolean = true;
  private _value: any;
  private _effect: ReactiveEffect;
  constructor(fn){
    // 实例化effect 依赖的响应式属性变化触发
    this._effect = new ReactiveEffect(fn,()=>{
      this._dirty = true  // 依赖的响应式属性变化是执行这个schdule,而不会执行fn
    })  
  }
  get value(){
    if (this._dirty) {
      this._dirty =false
      this._value = this._effect.run()
    }
    return this._value
  }
}
export function computed(fn) {
  return new ComputedRefImpl(fn)
}