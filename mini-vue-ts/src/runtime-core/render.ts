import { isObject } from "../shared";
import { createComponentInstance, setupComponent } from "./component";

export function render(vnode, container) {
  patch(vnode, container);
}
function patch(vnode, container) {
  if (typeof vnode.type === "string") {
    // 处理元素
    processElement(vnode, container);
  } else if (isObject(vnode.type)) {
    // 处理组件
    processComponent(vnode, container);
  }
}
function processElement(vnode: any, container: any) {
  // 初始化元素
  mountElement(vnode, container);
}
function mountElement(vnode: any, container: any) {
  const el:HTMLElement = document.createElement(vnode.type);
  const { children } = vnode;
  if (typeof children === "string") {
    // 文本内容直接设置
    el.textContent = children;
  } else if (Array.isArray(children)) {
    // 数组类型 遍历后调用Patch
    mountChildren(vnode, el);
  }
  // 处理props属性
  const { props } = vnode;
  for (const key in props) {
    const element = props[key];
    el.setAttribute(key, element);
  }
  container.append(el);
}
function mountChildren(vnode: any, el: HTMLElement) {
  vnode.children.forEach((element) => {
    patch(element, el);
  });
}

// 处理组件
function processComponent(vnode: any, container: any) {
  // 挂载组件
  mountComponent(vnode, container);
}
// 挂载组件
function mountComponent(vnode: any, container) {
  // 创建组件实例
  const instance = createComponentInstance(vnode);
  setupComponent(instance);
  setupRederEffect(instance, container);
}

function setupRederEffect(instance: any, container) {
  const subTree = instance.render();
  // subTree h函数返回的内容
  patch(subTree, container);
}
