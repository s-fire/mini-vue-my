import { isObject } from "../shared";
import {
  mutableHandles,
  readonlyHandles,
  shallowReadonlyHandles,
} from "./baseHandles";
export const enum ReactiveFlags {
  IS_REACTIVE = "__v_isReactive",
  IS_READONLY = "__v_isRadonly",
}
export function reactive(raw) {
  return createReactiveObj(raw, mutableHandles);
}
export function readonly(raw) {
  return createReactiveObj(raw, readonlyHandles);
}
function createReactiveObj(raw: any, baseHandles) {
  if (!isObject(raw)) {
    console.warn(`target ${raw}必须是一个对象`);
    return raw
  }
  return new Proxy(raw, baseHandles);
}
export function isReactive(raw) {
  // 手动访问raw的一个属性 会触发getter函数从而根据是否是readonly判断是否是reative
  // 如果不是一个ractive 则raw上不会有__v_isReactive 此时不会触发getter 会返回undefinde
  return !!raw[ReactiveFlags.IS_REACTIVE];
}
export function isReadonly(raw) {
  // 更具触发getter时是否传有readonly参数来判断
  return !!raw[ReactiveFlags.IS_READONLY];
}
export function shallowReadonly(raw) {
  return createReactiveObj(raw, shallowReadonlyHandles);
}
export function isProxy(val) {
  return isReactive(val) || isReadonly(val);
}
