export function createVnode(type,props?,children?) {
  // type传入的App配置
  return {
    type,
    props,
    children,
    el:null // 保存当前的el dom
  }
  
}