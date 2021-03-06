import { isObject } from "../shared";
import { ShapeFlags } from "../shared/ShapeFlags";
import { createComponentInstance, setupComponent } from "./component";

export function render(vnode, container) {
  patch(vnode, container);
}
function patch(vnode, container) {
  const { shapeFlag } = vnode;
  // 这里是 & 运算  获取当前vnode的类型
  if (shapeFlag & ShapeFlags.ELEMENT) {
    // 处理元素
    processElement(vnode, container);
  } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
    // 处理组件
    processComponent(vnode, container);
  }
}
function processElement(vnode: any, container: any) {
  // 初始化元素
  mountElement(vnode, container);
}
function mountElement(vnode: any, container: any) {
  const el: HTMLElement = (vnode.el = document.createElement(vnode.type));
  const { children, shapeFlag } = vnode;
  if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
    // 文本内容直接设置
    el.textContent = children;
  } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
    // 数组类型 遍历后调用Patch
    mountChildren(vnode, el);
  }
  // 处理props属性
  const { props } = vnode;
  for (const key in props) {
    const element = props[key];
    const isOn = (key: string) => /^on[A-Z]/.test(key);
    if (isOn(key)) {
      const evnet = key.slice(2).toLowerCase();
      el.addEventListener(evnet, element);
    } else {
      el.setAttribute(key, element);
    }
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
function mountComponent(initalVnode: any, container) {
  // 创建组件实例
  const instance = createComponentInstance(initalVnode);
  setupComponent(instance);
  setupRederEffect(instance, initalVnode, container);
}

function setupRederEffect(instance: any, initalVnode, container) {
  const { proxy } = instance;
  const subTree = instance.render.call(proxy);
  // subTree h函数返回的内容
  patch(subTree, container);
  initalVnode.el = subTree.el; // 把根节点的el保存到当前组件的虚拟节点上 用于this.$el访问
}
