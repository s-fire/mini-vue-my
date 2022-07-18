import { hasChanged, isObject } from "../shared";
import { isTracking, trackEffects, triggerEffects } from "./effect";
import { reactive } from "./reactive";

class RefImpl {
  private _value: any;
  public dep;
  private _rawValue: any; // 保存传入的原始值  用于比对是否新值是否有修改
  public __v_isRef = true
  constructor(val) {
    this._rawValue = val;
    this._value = convert(val);
    this.dep = new Set();
  }
  get value() {
    // 进行依赖收集  调用effect里的track方法
    trackRefValue(this);
    return this._value;
  }
  set value(val) {
    if (hasChanged(this._rawValue, val)) {
      this._rawValue = val;
      this._value = convert(val);
      triggerEffects(this.dep);
    }
  }
}
function convert(val) {
  return isObject(val) ? reactive(val) : val;
}
function trackRefValue(ref) {
  if (isTracking()) {
    trackEffects(ref.dep);
  }
}
export function ref(raw) {
  return new RefImpl(raw);
}
export function isRef(val) {
  return !!val.__v_isRef
}
export function unRef(val) {
  return isRef(val) ? val.value : val
}
export function proxyRef(objectWithRef) {
  return new Proxy(objectWithRef,{
    get(target,key){
      return unRef(Reflect.get(target,key))
    },
    set(target,key,value){
      if (isRef(target[key]) && !isRef(value)) {
        // 如果修改的新值不是ref 则修改本来的.value
        return target[key].value= value
      }else{
        // 新值是一个ref 则直接替换
        return Reflect.set(target,key,value)
      }
    }
  })
  
}
