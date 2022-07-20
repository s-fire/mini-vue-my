const isObject = (val) => {
    return val !== null && typeof val === "object";
};

function createComponentInstance(vnode) {
    const component = {
        vnode,
        type: vnode.type
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
    if (typeof vnode.type === "string") {
        // 处理元素
        processElement(vnode, container);
    }
    else if (isObject(vnode.type)) {
        // 处理组件
        processComponent(vnode, container);
    }
}
function processElement(vnode, container) {
    // 初始化元素
    mountElement(vnode, container);
}
function mountElement(vnode, container) {
    const el = document.createElement(vnode.type);
    const { children } = vnode;
    if (typeof children === "string") {
        // 文本内容直接设置
        el.textContent = children;
    }
    else if (Array.isArray(children)) {
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
function mountComponent(vnode, container) {
    // 创建组件实例
    const instance = createComponentInstance(vnode);
    setupComponent(instance);
    setupRederEffect(instance, container);
}
function setupRederEffect(instance, container) {
    const subTree = instance.render();
    // subTree h函数返回的内容
    patch(subTree, container);
}

function createVnode(type, props, children) {
    // type传入的App配置
    return {
        type,
        props,
        children
    };
}

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

export { createApp, h };
//# sourceMappingURL=mini-vue.esm.js.map
