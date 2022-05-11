
Vue有三大主要模块，**Render**渲染模块、**Mount**挂载模块、**Patch**更新模块，在 [实现mini版vue的mount函数](https://juejin.cn/post/7081247627211177992) 这一节里，我们实现了简版的Render和Mount模块。Patch更新模块也是在这两块的基础上实现的。所以这篇我们继续实现一个简单的Patch更新模块。
## patch函数的作用
patch函数是在节点更新阶段调用的，简单来说就是用来比较新老两个节点不同的地方，完成对节点的更新操作。调用方式为:
```javascript
patch(oldTag,newTag)
```
其中oldTag表示老的节点,newTag表示新的节点
## 实现Patch函数
### 整体步骤
- 先比较节点类型是否一样，如果不一样就直接整个节点全部替换，如果节点名称一样的话再继续比较新旧节点的props和children，对有差异的地方进行替换
#### 比较props
   1. 取出新老节点的props，值为两个javascript对象，只需比较这两个对象的属性和属性值即可。
   2. 先遍历新节点props里的所有属性，在老节点props里找对应属性的属性值，如果新老节点相同属性的属性值不相同，就在新节点添加上对应的属性和属性值。这里可以比较出新节点在新节点里增加的一些在老节点里不存在的属性或者修改后的属性。
   3. 在第2步中，我们找出了在新节点里修改过或者新增加的节点属性，但是还有可能在新节点里删除了老节点的一些属性。对于这种情况处理办法就是遍历老节点的所有属性，如果在新节点里找不到对应的属性，那么就可以把该属性从节点上删除掉。

```JavaScript
  /* 
    n1 oldTag
    n2 newTag
  */
  function patch(n1,n2){
    if (n1.tag===n2.tag) {
      // 取出元素 此时的n1就是上面Mount函数里的vdom 上面的el属性是mount函数执行时保存的真实dom树
      // 这里再把旧的el赋值给新节点的el  因为在下次更新的时候此时的新节点已经变成了旧节点
      const el=n2.el =n1.el
      // 如果是相同标签的元素
      // 处理props
      const oldProps=n1.props
      const newProps=n2.props
      // 此时的新旧两个props都是一个对象,需要比较两个对象属性的差别
      // 遍历新节点的props
      for (const key in newProps) {
        if (Object.hasOwnProperty.call(newProps, key)) {
          const newValue = newProps[key]; //新节点props的一个属性值
          const oldValue = oldProps[key]  //旧节点对应的属性值
          if (newValue!==oldValue) {
            el.setAttribute(key,newValue)
          }
        }
      }
      //遍历旧的props,查看新的节点是否删除了一些props
      for (const key in oldProps) {
        //这里只需要比较旧props里的key是否在新props里面存在，不存在就删除掉对应的属性即可
        if (!(key in newProps)) {
          el.removeAttribute(key)
        }
      }
      // 在真实的vue3里面编译的时候会判断props是否是静态的，如果是静态的这部分比较的代码就不需要执行
    }else{
      // 不是相同标签的元素   需要全部替换
    }
  }
```

### 比较children
这里会稍微复杂一点，因为新旧children可能会分别为字符串或者数组的排列组合，要对不同的情况分别进行处理。
- 新节点是string，旧节点也是string
  
  这种情况就只需要把对应节点的内容替换掉就可以了
- 新节点是string，旧节点是数组
  
  这种情况和上面的一样，也是直接替换掉旧节点的内容就可以

- 新节点是数组，旧节点是string
  
  这种情况需要先把旧节点清空，然后遍历新节点数组，调用mount函数分别渲染每个children节点
- 新节点是数组，旧节点也是数组
  这种情况是相比较最复杂的地方，处理方式为先找出新老数组的公共长度，公共长度部分调用patch方法去更新，非公共部分再分别处理
  + 如果新数组长度大于老数组，则把 **新数组** 截取掉 **老数组** 长度部分之后剩余的部分再遍历循环调用mount函数挂载。
  + 如果新数组的长度小于老数组，则把 **老数组** 截取掉 **新数组** 长度部分之后再循环遍历剩余部分删除掉对应的节点。  
```javascript
  /* 
    n1 oldTag
    n2 newTag
  */
  function patch(n1,n2){
    if (n1.tag===n2.tag) {
      // 取出元素 此时的n1就是上面Mount函数里的vdom 上面的el属性是mount函数执行时保存的真实dom树
      // 这里再把旧的el赋值给新节点的el  因为在下次更新的时候此时的新节点已经变成了旧节点
      const el=n2.el =n1.el
      // 比较children
      const oldChildren=n1.children
      const newChildren=n2.children
      // 先判断children是否是字符串
      if (typeof(newChildren)==='string') {
        if (typeof(oldChildren)==='string') {
          // 新旧节点都是字符串，只需要改变文本内容即可
          if (newChildren!==oldChildren) {
            el.textContent=newChildren
          }
        }else{
          // 旧props是数组 只需要替换成文本就可以
          el.textContent = newChildren
        }
      }else{
        // 新children是数组
        if (typeof(oldChildren)==='string') {
          //旧节点是string 则需要把旧节点的内容清空，然后再遍历新children调用mount函数进行渲染
          el.innerHtml=''
          newChildren.forEach(child=>{
            mount(child,el)
          })
        }else{
          // 旧的节点也是数组
          /* 
            1、先取出两个数组的公共长度
            2、调用Patch方法比较公共长度部分的内容
            3、如果新数组比旧数组长，则新数组截取掉旧数组长度的部分剩余的遍历mount
            4、如果新数组比旧数组短，则旧数组截取掉新数组长度部分之后遍历删除节点
          */
         // 先处理公共长度部分
         const commonLength = Math.min(newChildren.length,oldChildren.length)
         for (let index = 0; index < commonLength; index++) {
           patch(oldChildren[index],newChildren[index])
         }
         if (newChildren.length>oldChildren.length) {
           newChildren.slice(oldChildren.length).forEach(child=>{
             mount(child,el)
           })
         }else if(newChildren.length<oldChildren.length){
           oldChildren.slice(newChildren.length).forEach(child=>{
             el.removeChild(child.el)
           })
         }
        }
      }
    }else{
      // 不是相同标签的元素   需要全部替换
    }
  }
```
至此，结合对props处理和children处理部分的代码便是一个简单patch函数的所有功能了

完整代码如下:
```JavaScript
  /* 
    n1 oldTag
    n2 newTag
  */
  function patch(n1,n2){
    if (n1.tag===n2.tag) {
      // 取出元素 此时的n1就是上面Mount函数里的vdom 上面的el属性是mount函数执行时保存的真实dom树
      // 这里再把旧的el赋值给新节点的el  因为在下次更新的时候此时的新节点已经变成了旧节点
      const el=n2.el =n1.el
      // 如果是相同标签的元素
      // 处理props
      const oldProps=n1.props
      const newProps=n2.props
      // 此时的新旧两个props都是一个对象,需要比较两个对象属性的差别
      // 遍历新节点的props
      for (const key in newProps) {
        if (Object.hasOwnProperty.call(newProps, key)) {
          const newValue = newProps[key]; //新节点props的一个属性值
          const oldValue = oldProps[key]  //旧节点对应的属性值
          if (newValue!==oldValue) {
            el.setAttribute(key,newValue)
          }
        }
      }
      //遍历旧的props,查看新的节点是否删除了一些props
      for (const key in oldProps) {
        //这里只需要比较旧props里的key是否在新props里面存在，不存在就删除掉对应的属性即可
        if (!(key in newProps)) {
          el.removeAttribute(key)
        }
      }
      // 在真实的vue3里面编译的时候会判断props是否是静态的，如果是静态的这部分比较的代码就不需要执行

      // 比较children
      const oldChildren=n1.children
      const newChildren=n2.children
      // 先判断children是否是字符串
      if (typeof(newChildren)==='string') {
        if (typeof(oldChildren)==='string') {
          // 新旧节点都是字符串，只需要改变文本内容即可
          if (newChildren!==oldChildren) {
            el.textContent=newChildren
          }
        }else{
          // 旧props是数组 只需要替换成文本就可以
          el.textContent = newChildren
        }
      }else{
        // 新children是数组
        if (typeof(oldChildren)==='string') {
          //旧节点是string 则需要把旧节点的内容清空，然后再遍历新children调用mount函数进行渲染
          el.innerHtml=''
          newChildren.forEach(child=>{
            mount(child,el)
          })
        }else{
          // 旧的节点也是数组
          /* 
            1、先取出两个数组的公共长度
            2、调用Patch方法比较公共长度部分的内容
            3、如果新数组比旧数组长，则新数组截取掉旧数组长度的部分剩余的遍历mount
            4、如果新数组比旧数组短，则旧数组截取掉新数组长度部分之后遍历删除节点
          */
         // 先处理公共长度部分
         const commonLength = Math.min(newChildren.length,oldChildren.length)
         for (let index = 0; index < commonLength; index++) {
           patch(oldChildren[index],newChildren[index])
         }
         if (newChildren.length>oldChildren.length) {
           newChildren.slice(oldChildren.length).forEach(child=>{
             mount(child,el)
           })
         }else if(newChildren.length<oldChildren.length){
           oldChildren.slice(newChildren.length).forEach(child=>{
             el.removeChild(child.el)
           })
         }
        }
      }
    }else{
      // 不是相同标签的元素   需要全部替换
    }
  }
```
