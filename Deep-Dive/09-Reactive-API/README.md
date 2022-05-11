reactive是Vue3里的核心模块之一:响应式模块。在我们开发中之所以把数据的值改变之后视图可以及时更新的主要原因就是因为这个响应式模块所提供的能力。

在Vue2里这个功能是通过 Object.defineProperties 截止对象属性的get()和set()方法来实现，但是这样存在一些问题，例如如果对象的某个属性在初始化的时候没有定义，后面再去添加时是无法触发set()从而无法实现响应式更新的。另一方面，在初始化的时候就需要对所有对象的所有属性都需要进行这样的操作，对性能也是一种浪费。

在Vue3里由于不考虑兼容ie的问题，所以直接使用了Proxy来对对象进行代理。和 Object.defineProperties 类似，也是对Proxy里的get()和set()进行一些操作，不同的是，用了Proxy之后，相当于在普通的JavaScript对象上加上了一层代理层，只有在访问或者修改对象的某个属性的时候才会触发对应的get()和set(),而不要在初始化的时候就把所有对象的所有属性都遍历一遍，所以性能方面有很大的提升，另外，也可以代理到对象初始化是未定义的属性的get()和set()操作

## reactive本质
reactive本质就是一个函数，通过传入一个普通的JavaScript对象，返回一个经过处理的响应式对象。
```JavaScript
    function reactive(raw) {
    return new Proxy(raw, {
      get(target, key) {
        return target[key]
      },
      set(target, key, newValue) {
        target[key] = newValue
      }
    })
  }
```
## 细化实现get()和set()
想象一下，在开发的过程中，我们常常会对定义多个reactive对象，当我们修改某个对象的某个属性的时候，如何去找到这个属性修改之后需要做的操作呢。构想一下如下的数据结构
```javascript
  {
    {target}:{
      key1:['effect1'],
      key2:['effect2'],
    },
    {target}:{
      key1:['effect1'],
      key2:['effect2'],
    },
  }
```
注意，**这里第一层对象的key是一个对象**,有了这种数据结构之后，就可以通过对象找到对象上的所有Key以及每个key对应的所有依赖。在Vue3里是通过WeakMap来实现这种数据结构的。
```JavaScript
    const targetMap = new WeakMap()
    function reactive(raw) {
    return new Proxy(raw, {
      get(target, key) {
        let depsMap = targetMap.get(target)
        if (!depsMap) {
          targetMap.set(target, (depsMap = new Map()))
        }
        let deps = depsMap.get(key)
        if (!deps) {
          depsMap.set(key, (deps = new Set()))
        }
        // ...收集依赖
        return target[key]
      },
      set(target, key, newValue) {
        let depsMap = targetMap.get(target)
        if (!depsMap) {
          targetMap.set(target, (depsMap = new Map()))
        }
        let deps = depsMap.get(key)
        if (!deps) {
          depsMap.set(key, (deps = new Set()))
        }
        target[key] = newValue
        // ...触发依赖
      }
    })
  }
```
## 实现watchEffect
watchEffect本质也是一个函数，接受一个函数做为参数，在这个做为参数的函数里去实现响应式属性修改之后需要做的操作

上面代理里注释所指的依赖就是我们常常所说的effect,一般都是在effect里去对响应式对象属性进行访问和修改的操作，所以收集依赖和触发依赖指的都是访问或者修改的当前响应式对象所处的effect。 
```javascript
    let activeEffect //定义一个全局变量保存当前的effect用于在reactive里面get()和set()时可以找到
    function watchEffect(effect) {
      activeEffect = effect
      effect()
      activeEffect = null
    }
```
修改reactive的逻辑代码
```JavaScript
    const targetMap = new WeakMap()
    function reactive(raw) {
    return new Proxy(raw, {
      get(target, key) {
        let depsMap = targetMap.get(target)
        if (!depsMap) {
          targetMap.set(target, (depsMap = new Map()))
        }
        let deps = depsMap.get(key)
        if (!deps) {
          depsMap.set(key, (deps = new Set()))
        }
        // ...收集依赖
        deps.add(activeEffect)
        return target[key]
      },
      set(target, key, newValue) {
        let depsMap = targetMap.get(target)
        if (!depsMap) {
          targetMap.set(target, (depsMap = new Map()))
        }
        let deps = depsMap.get(key)
        if (!deps) {
          depsMap.set(key, (deps = new Set()))
        }
        target[key] = newValue
        if (deps) {
          deps.forEach(effect => {
            effect.run()
          });
        }
      }
    })
  }
```
测试效果
```JavaScript
  const state = reactive({
    count: 0
  })
  watchEffect(() => {
    console.log(state.count);
  })
  state.count++
```