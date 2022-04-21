// 解决effect里面嵌套effect时，effect引用错误的问题
let effectStack: Array<any> = []
let activeEffect
class ReactiveEffect {
  constructor(public fn: () => void) { }
  active = true
  deps = [] // 记录当前effect依赖了哪些属性
  run(): void {
    if (!this.active) {
      return this.fn()
    }
    if (!effectStack.includes(this)) {
      //解决同一个effect会多次执行,例如在effect把响应式对象的值设置为随机数，如果不做这个判断会无线循环调用effect
      try {
        effectStack.push(activeEffect = this) // 将当前effect推入栈中
        this.fn()
      } finally {
        effectStack.pop()
        /* 
          当前effect执行完成之后，当前effect的依赖收集结束,从栈中删掉当前的effect
          如果是effect嵌套调用的情况，会先从最里面的effect开始往外删除
        */
        activeEffect = effectStack[effectStack.length - 1] //此时effectStack的最后一个是当前执行完毕的effect的上层effect
      }
    }
  }
}
export function track(target: object, key: string | symbol) {
  console.log('key: ', key);
  console.log('target: ', target);

}
export function effect(fn: () => void) {
  const _effect = new ReactiveEffect(fn)
  _effect.run()
}