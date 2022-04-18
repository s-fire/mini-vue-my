Reflect.get()
Reflect.get() 方法与从对象 (target[key]) 中读取属性类似，但它是通过一个函数执行来操作的。

为什么直接用 target[key] 就能得到值，却还要用 Reflect.get(target, key, receiver) 来多倒一手呢？

先来看个简单的示例：

const p = new Proxy([1, 2, 3], {
    get(target, key, receiver) {
        return target[key]
    },
    set(target, key, value, receiver) {
        target[key] = value
    }
})

p.push(100)
运行这段代码会报错：

Uncaught TypeError: 'set' on proxy: trap returned falsish for property '3'
但做一些小改动就能够正常运行：

const p = new Proxy([1, 2, 3], {
    get(target, key, receiver) {
        return target[key]
    },
    set(target, key, value, receiver) {
        target[key] = value
        return true // 新增一行 return true
    }
})

p.push(100)
这段代码可以正常运行。为什么呢？

区别在于新的这段代码在 set() 方法上多了一个 return true。我在 MDN 上查找到的解释是这样的：

set() 方法应当返回一个布尔值。

返回 true 代表属性设置成功。
在严格模式下，如果 set() 方法返回 false，那么会抛出一个 TypeError 异常。
这时我又试了一下直接执行 p[3] = 100，发现能正常运行，只有执行 push 方法才报错。到这一步，我心中已经有答案了。为了验证我的猜想，我在代码上加了 console.log()，把代码执行过程的一些属性打印出来。

const p = new Proxy([1, 2, 3], {
    get(target, key, receiver) {
        console.log('get: ', key)
        return target[key]
    },
    set(target, key, value, receiver) {
        console.log('set: ', key, value)
        target[key] = value
        return true
    }
})

p.push(100)

// get:  push
// get:  length
// set:  3 100
// set:  length 4
从上面的代码可以发现执行 push 操作时，还会访问 length 属性。推测执行过程如下：根据 length 的值，得出最后的索引，再设置新的置，最后再改变 length。

结合 MDN 的解释，我的推测是数组的原生方法应该是运行在严格模式下的（如果有网友知道真相，请在评论区留言）。因为在 JS 中很多代码在非严格模式和严格模式下都能正常运行，只是严格模式会给你报个错。就跟这次情况一样，最后设置 length 属性的时候报错，但结果还是正常的。如果不想报错，就得每次都返回 true。

然后再看一下 Reflect.set() 的返回值说明：

返回一个 Boolean 值表明是否成功设置属性。
所以上面代码可以改成这样：

const p = new Proxy([1, 2, 3], {
    get(target, key, receiver) {
        console.log('get: ', key)
        return Reflect.get(target, key, receiver)
    },
    set(target, key, value, receiver) {
        console.log('set: ', key, value)
        return Reflect.set(target, key, value, receiver)
    }
})

p.push(100)
另外，不管 Proxy 怎么修改默认行为，你总可以在 Reflect 上获取默认行为。

通过上面的示例，不难理解为什么要通过 Reflect.set() 来代替 Proxy 完成默认操作了。同理，Reflect.get() 也一样。