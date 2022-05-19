function patchClass(el:HTMLElement,value) {
  if (value === null) {
    el.removeAttribute('class')
  }else{
    el.className = value
  }
}

function patchStyle(el:HTMLElement,prev,next) {
  const style = el.style
  for (const key in next) { // 遍历新的style 全部添加到style上
    if (Object.prototype.hasOwnProperty.call(next, key)) {
      style[key] = next[key];
    }
  }

  for (const key in prev) {
    if (Object.prototype.hasOwnProperty.call(prev, key)) {
      if (next[key]===null) { //如果老的style在新的style里面没有
        style[key] = null
      }
    }
  }
}
function createInvoker(value) { // 返回事件的引用
  const invoker = (e)=>{
    invoker.value(e)
  }
  invoker.value = value  // 保存变量，后续换绑的话更新这个value的值
  return invoker
}
function patchAttr(el,key,value) {
  if (value===null) {
    el.removeAttribute(key)
  }else{
    el.setAttribute(key,value)
  }
  
}
function patchEvent(el,key:string,nextValue:HTMLElementEventMap) {
  const invokers = el._vei || (el._vei = {}) // 在元素上创建一个自定义属性，记录绑定的事件
  let exisitingInvoker = invokers[key] // 先查看是否绑定过这个事件
  if (exisitingInvoker && nextValue) { // 如果绑定过且有新的事件 就需要换绑
    exisitingInvoker.value = nextValue
  }else{
    const name = key.slice(2).toLowerCase() // 取出事件名
    if (nextValue) {
      const invoker = invokers[key] = createInvoker(nextValue) //从元素的invokers里取出之前存好的事件
      el.addEventListener(name,invoker)
    }else if (exisitingInvoker) {
      // 之前绑定过  但是新的没有  所以要删除事件
      el.removeEventListener(name,exisitingInvoker)
      invokers[key] = undefined
    }
  }
}
export const patchProp = (el:HTMLElement,key,prevValue,nextValue) =>{
  if (key==='class') { // 类名
    patchClass(el,nextValue)
  }else if (key === 'style') {
    patchStyle(el,prevValue,nextValue)
  }else if (/^on[^a-z]/.test(key)) {
    patchEvent(el,key,nextValue)
  }else{
    // 其他属性
    patchAttr(el,key,nextValue)
  }
}