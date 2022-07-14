import { mutableHandles, readonlyHandles } from "./baseHandles";
 
export function reactive(raw) {
  return createReactiveObj(raw,mutableHandles)
}
export function readonly(raw) {
  return createReactiveObj(raw,readonlyHandles);
}
function createReactiveObj(raw: any,baseHandles) {
  return new Proxy(raw, baseHandles);
}

