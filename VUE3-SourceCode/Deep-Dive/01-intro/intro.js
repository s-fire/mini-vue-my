/* 
  vue 有三个主要模块
  1、Render Phase   渲染模块
      调用render函数  返回一个虚拟节点
  2、Mount Phase  挂载阶段
    使用虚拟dom节点 调用mount函数 调用Dom Api来创建网页
  3、更新阶段
    将旧的虚拟节点和新的虚拟节点比较，更新变化的部分
*/