var ShapeFlags;
(function (ShapeFlags) {
    ShapeFlags[ShapeFlags["ELEMENT"] = 1] = "ELEMENT";
    ShapeFlags[ShapeFlags["STATEFUL_COMPONENT"] = 2] = "STATEFUL_COMPONENT";
    ShapeFlags[ShapeFlags["TEXT_CHILDREN"] = 4] = "TEXT_CHILDREN";
    ShapeFlags[ShapeFlags["ARRAY_CHILDREN"] = 8] = "ARRAY_CHILDREN";
})(ShapeFlags || (ShapeFlags = {}));

const isObject = (val) => {
    return val !== null && typeof val === "object";
};
const extend = Object.assign;
const hasOwn = (val, key) => Object.prototype.hasOwnProperty.call(val, key);

const targetsMap = new Map();
function triggerEffects(dep) {
    dep.forEach((effect) => {
        if (effect.scheduler) {
            effect.scheduler();
        }
        else {
            effect.run();
        }
    });
}
function trigger(target, key) {
    let depsMap = targetsMap.get(target);
    if (!depsMap) {
        return;
    }
    let dep = depsMap.get(key);
    if (dep) {
        triggerEffects(dep);
    }
}

const get = createGetter();
const set = createSetter();
const readOnlyGet = createGetter(true);
const shallowReadonlyGet = createGetter(true, true);
function createGetter(isReadonly = false, isShallow = false) {
    return function get(target, key) {
        if (key === ReactiveFlags.IS_REACTIVE) {
            // 此时是在调用isReactive
            return !isReadonly;
        }
        else if (key === ReactiveFlags.IS_READONLY) {
            return isReadonly;
        }
        const res = Reflect.get(target, key);
        if (isShallow) {
            return res;
        }
        if (isObject(res)) {
            return isReadonly ? readonly(res) : reactive(res);
        }
        return res;
    };
}
function createSetter() {
    return function set(target, key, value) {
        const res = Reflect.set(target, key, value);
        trigger(target, key);
        return res;
    };
}
const mutableHandles = {
    get: get,
    set: set,
};
const readonlyHandles = {
    get: readOnlyGet,
    set(target, key, value) {
        console.warn(`readonly not able to set`);
        return true;
    },
};
const shallowReadonlyHandles = extend({}, readonlyHandles, {
    get: shallowReadonlyGet,
});

var ReactiveFlags;
(function (ReactiveFlags) {
    ReactiveFlags["IS_REACTIVE"] = "__v_isReactive";
    ReactiveFlags["IS_READONLY"] = "__v_isRadonly";
})(ReactiveFlags || (ReactiveFlags = {}));
function reactive(raw) {
    return createReactiveObj(raw, mutableHandles);
}
function readonly(raw) {
    return createReactiveObj(raw, readonlyHandles);
}
function createReactiveObj(raw, baseHandles) {
    if (!isObject(raw)) {
        console.warn(`target ${raw}必须是一个对象`);
        return raw;
    }
    return new Proxy(raw, baseHandles);
}
function shallowReadonly(raw) {
    return createReactiveObj(raw, shallowReadonlyHandles);
}

function initProps(instance, rawProps) {
    instance.props = rawProps || {};
}

const publicPropertiesMap = {
    $el: (i) => i.vnode.el
};
const publicInstanceProxyHandlers = {
    get({ _: instance }, key) {
        const { setupState, props } = instance;
        if (hasOwn(setupState, key)) {
            return setupState[key];
        }
        else if (hasOwn(props, key)) {
            return props[key];
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
        setupState: {},
        props: {}
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
        props
      }
    */
    initProps(instance, instance.vnode.props);
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
        const setupResult = setup(shallowReadonly(instance.props)); // 把props传给setup函数
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
    const el = (vnode.el = document.createElement(vnode.type));
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
        const isOn = (key) => /^on[A-Z]/.test(key);
        if (isOn(key)) {
            const evnet = key.slice(2).toLowerCase();
            el.addEventListener(evnet, element);
        }
        else {
            el.setAttribute(key, element);
        }
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

export { createApp, h };
//# sourceMappingURL=mini-vue.esm.js.map
