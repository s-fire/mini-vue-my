import { track, trigger } from "./effect";
const get = createGetter()
const set = createSetter()
const readOnlyGet = createGetter(true)
function createGetter(isReadonly = false) {
  return function get(target, key) {
    const res = Reflect.get(target, key);
    if (!isReadonly) {
      track(target, key);
    }
    return res;
  };
}
function createSetter() {
  return function set(target, key, value) {
    const res = Reflect.set(target, key, value);
    trigger(target, key);
    return res;
  };
}
export const mutableHandles = {
  get: get,
  set: set,
};
export const readonlyHandles = {
  get: readOnlyGet,
  set(target, key, value) {
    console.warn(`readonly not able to set`)
    return true;
  },
};
