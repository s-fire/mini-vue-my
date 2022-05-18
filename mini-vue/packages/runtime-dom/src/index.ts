/* 
  需要涵盖dom操作的api 属性操作的api 将这些api传入到runtime-core中 
  runtime-core 在操作中不需要依赖于平台代码 (平台代码是被传入的)

  渲染页面的时候需要的节点操作的一系列方法
*/
import { nodeOps } from "./nodeOps";
export * from "@vue/runtime-core"