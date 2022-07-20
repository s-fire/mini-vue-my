'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

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
    patch(vnode);
}
function patch(vnode, container) {
    // 处理组件
    processComponent(vnode);
}
// 处理组件
function processComponent(vnode, container) {
    // 挂载组件
    mountComponent(vnode);
}
// 挂载组件
function mountComponent(vnode, container) {
    // 创建组件实例
    const instance = createComponentInstance(vnode);
    setupComponent(instance);
    setupRederEffect(instance);
}
function setupRederEffect(instance, container) {
    const subTree = instance.render();
    // subTree h函数返回的内容
    patch(subTree);
}

function createVnode(type, prop, children) {
    // type传入的App配置
    return {
        type,
        prop,
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
            render(vnode);
        }
    };
}

function h(type, prop, children) {
    return createVnode(type, prop, children);
}

exports.createApp = createApp;
exports.h = h;
//# sourceMappingURL=mini-vue.cjs.js.map
