/* 
  需要涵盖dom操作的api 属性操作的api 将这些api传入到runtime-core中 
  runtime-core 在操作中不需要依赖于平台代码 (平台代码是被传入的)

  渲染页面的时候需要的节点操作的一系列方法
*/
import { nodeOps } from "./nodeOps";
import { patchProp } from "./patchProp";
import { createRender } from "@vue/runtime-core";
const renderOptions = Object.assign(nodeOps,{patchProp})
console.log('renderOptions: ', renderOptions);

// 将renderOptions传入到core中

export const createApp = (component,rootProps=null)=>{
  const {createApp} = createRender(renderOptions)
  let app = createApp(component,rootProps)
  let {mount} = app // 获取core中的mount方法
  app.mount=function(container){ //重写mount
    container = nodeOps.querySelector(container)
    container.innerHtml = ''
    mount(container)
  } 
  return app
}
export * from "@vue/runtime-core" 