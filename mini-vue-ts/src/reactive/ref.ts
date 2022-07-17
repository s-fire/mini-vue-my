import { isObject } from "../shared";
import { isTracking, trackEffects, triggerEffects } from "./effect";
import { reactive } from "./reactive";

class RefImpl {
  private _value: any;
  public dep;
  constructor(val) {
    this._value = isObject(val) ? reactive(val) : val;
    this.dep = new Set();
  }
  get value() {
    // 进行依赖收集  调用effect里的track方法
    if (isTracking()) {
      trackEffects(this.dep);
    }
    return this._value;
  }
  set value(val) {
    this._value = val;
    triggerEffects(this.dep);
  }
}
export function ref(raw) {
  return new RefImpl(raw);
}
