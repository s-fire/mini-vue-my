'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var ShapeFlags;
(function (ShapeFlags) {
    ShapeFlags[ShapeFlags["ELEMENT"] = 1] = "ELEMENT";
    ShapeFlags[ShapeFlags["STATEFUL_COMPONENT"] = 2] = "STATEFUL_COMPONENT";
    ShapeFlags[ShapeFlags["TEXT_CHILDREN"] = 4] = "TEXT_CHILDREN";
    ShapeFlags[ShapeFlags["ARRAY_CHILDREN"] = 8] = "ARRAY_CHILDREN";
})(ShapeFlags || (ShapeFlags = {}));

const publicPropertiesMap = {
    $el: (i) => i.vnode.el
};
const publicInstanceProxyHandlers = {
    get({ _: instance }, key) {
        const { setupState } = instance;
        if (key in setupState) {
            return setupState[key];
        }
        const publicGetter = publicPropertiesMap[key];
        if (publicGetter) {
            return publicGetter(instance);
        }
    }
};

function createComponentInstance(vnode) {
    const component = {
        vnode,
        type: vnode.type,
        setupState: {} // 保存setup的返回内容
    };
    return component;
}
function setupComponent(instance) {
    /*
      instance{  // 组件实例
        vnode{  // 组件虚拟节点
          type // 传入的App组件配置
        }
        type // 传入的App组件配置
      }
    */
    // 实例化有状态组件
    setupStatefulComponent(instance);
}
function setupStatefulComponent(instance) {
    /*
      instance{  // 组件实例
        vnode{  // 组件虚拟节点
          type // 传入的App组件配置
        }
        type // 传入的App组件配置
      }
    */
    const Component = instance.type; // 传入的App配置
    // 创建组件代理对象  用于访问this.xxx
    instance.proxy = new Proxy({ _: instance }, publicInstanceProxyHandlers);
    // 取到App里的setup函数
    const { setup } = Component;
    if (setup) {
        const setupResult = setup();
        handleSetupResult(instance, setupResult);
    }
}
function handleSetupResult(instance, setupResult) {
    // setup函数有可能返回函数或者对象
    if (typeof (setupResult) === 'object') {
        // 把setup返回的对象保存到实例上
        instance.setupState = setupResult;
    }
    finishComponentSetup(instance);
}
function finishComponentSetup(instance) {
    const Component = instance.type;
    if (Component.render) {
        instance.render = Component.render;
    }
}

function render(vnode, container) {
    patch(vnode, container);
}
function patch(vnode, container) {
    const { shapeFlag } = vnode;
    // 这里是 & 运算  获取当前vnode的类型
    if (shapeFlag & ShapeFlags.ELEMENT) {
        // 处理元素
        processElement(vnode, container);
    }
    else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
        // 处理组件
        processComponent(vnode, container);
    }
}
function processElement(vnode, container) {
    // 初始化元素
    mountElement(vnode, container);
}
function mountElement(vnode, container) {
    const el = vnode.el = document.createElement(vnode.type);
    const { children, shapeFlag } = vnode;
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
        // 文本内容直接设置
        el.textContent = children;
    }
    else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
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
function mountChildren(vnode, el) {
    vnode.children.forEach((element) => {
        patch(element, el);
    });
}
// 处理组件
function processComponent(vnode, container) {
    // 挂载组件
    mountComponent(vnode, container);
}
// 挂载组件
function mountComponent(initalVnode, container) {
    // 创建组件实例
    const instance = createComponentInstance(initalVnode);
    setupComponent(instance);
    setupRederEffect(instance, initalVnode, container);
}
function setupRederEffect(instance, initalVnode, container) {
    const { proxy } = instance;
    const subTree = instance.render.call(proxy);
    // subTree h函数返回的内容
    patch(subTree, container);
    initalVnode.el = subTree.el; // 把根节点的el保存到当前组件的虚拟节点上 用于this.$el访问
}

function createVnode(type, props, children) {
    // type传入的App配置
    const vnode = {
        type,
        props,
        children,
        shapeFlag: getShapeFlage(type),
        el: null, // 保存当前的el dom
    };
    // children  这里可以理解为  | 运算 后的结果同时保留了原本的shapeFlag和children的shapeFlage
    if (typeof children === "string") {
        vnode.shapeFlag = vnode.shapeFlag | ShapeFlags.TEXT_CHILDREN;
    }
    else if (Array.isArray(children)) {
        vnode.shapeFlag = vnode.shapeFlag | ShapeFlags.ARRAY_CHILDREN;
    }
    return vnode;
}
// 设置vnode对应的shapeFlag
/*
  位运算  | 运算时 有 1 得1  & 运算时  全是1才得1
*/
function getShapeFlage(type) {
    return typeof type === "string"
        ? ShapeFlags.ELEMENT
        : ShapeFlags.STATEFUL_COMPONENT;
}
/*
  0001
  0100
  0101
  1000
*/

function createApp(rootComponent) {
    // 传入的App配置
    return {
        mount(rootContainer) {
            // 转换成虚拟节点
            // component -> vnode
            const vnode = createVnode(rootComponent);
            render(vnode, rootContainer);
        }
    };
}

function h(type, props, children) {
    return createVnode(type, props, children);
}

exports.createApp = createApp;
exports.h = h;
//# sourceMappingURL=mini-vue.cjs.js.map
