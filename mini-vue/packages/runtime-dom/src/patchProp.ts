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
export const patchProp = (el:HTMLElement,key,prevValue,nextValue) =>{
  if (key==='class') { // 类名
    patchClass(el,nextValue)
  }else if (key === 'style') {
    patchStyle(el,prevValue,nextValue)
  }else if (/^on[^a-z]/.test(key)) {
    
  }
}