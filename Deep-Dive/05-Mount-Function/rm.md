# 目标
## 实现vue的mount函数
```javascript
  mount(vdom,document.getElementById('app'))
```
mount 本质上是一个函数，接受虚拟dom和根节点两个参数，在vue里虚拟dom通常用h函数来生成，类似于这样
```JavaScript
  const vdom = h('div', { class: 'red' }, [
    
    h('span', null, 'hello')
  
  ])
```
其中第一个参数div表示的是节点的标签名，第二个参数就是当前节点的props(通常就是attribute和prototype或者事件),第三个参数就是节点的children，children里面也是放着同样结构的子节点。

所以通过h函数渲染之后的虚拟dom结构是这样的
```JavaScript
{
    "tag": "div",
    "props": {
        "class": "red"
    },
    "children": [
        {
            "tag": "span",
            "props": null,
            "children": "hello"
        }
    ]
}
```
由此可以发现，h函数的作用就是将传入的节点描述转换为一个javascript对象,具体的解析和挂载功能交给mount函数去实现。

## 实现h函数
```javascript
function h(tag,props,children){
  return {
    tag,

    props,

    children
  }
}
```
就是一个这么简单的转换功能

## 实现mount函数
mount函数要实现的功能就是将h函数返回的javascript对象进行解析，并挂载到传入的根标签上
1. 根据传入的tag标签名生成对应的标签
   ```javascript
   function mount(vnode,props,children){
     const el = document.createElement(vnode.tag)
   }
   ```
2.解析props并插入到标签上
  ```JavaScript
  function mount(vnode,props,children){
     const el = document.createElement(vnode.tag)
      // props可能是null
      if(props){
        for(const key in props){
          const value = props[key]
          // 这里默认值有attr 实际还会有prototype 事件等
          el.setAttribute(key,value)
        }
      }
   }
   ```
3.解析children
  - children有两种情况，一种是直接是字符串或者数字，也可能还是一个h函数，所以要分开处理，如果是字符串或者数字的话就直接添加到元素的文本里面，否则就继续调用mount函数解析。
  ```javascript
  function mount(vnode,props,chilred){
    ...
    
    if(typeOf vnode.children === 'string'){
      el.textContent = vnode.children
    }else{
      // 再次调用Mount函数,此时的container就是 el 了
      mount(vnode.children,el)
    }
  }
  ```
4. 挂载到页面上
  ```javascript
  function mount(vnode,props,chilred){
    ...
    document.appendChild(el)
  }
  ```
  至此一个简易的mount函数就实现完成了

  ## 最终代码:
  ```html
  <!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
</head>
<style>
  .red{
    color: red;
  }
</style>
<body>
<div id="app"></div>
</body>

</html>
<script>
  function h(tag, props, children) {
    // 将dom元素转换为javascript对象，返回给Mount函数处理
    console.log('h',tag);
    return {
      tag,
      props,
      children
    }
  }
  const vdom = h('div', { class: 'red' }, [
    h('span', null, 'hello')
  ])
  function mount(vnode, container) {
    console.log('vnode: ', vnode);
    //container 父级元素 一开始的时候是根标签App
    // 取出元素的标签名并创建元素
    const el = document.createElement(vnode.tag)
    if (vnode.props) {
      for (const key in vnode.props) {
        if (Object.hasOwnProperty.call(vnode.props, key)) {
          const element = vnode.props[key];
          // 这里默认只设置attribute 实际上还会有prototype、事件
          el.setAttribute(key, element)
        }
      }
    }
    // 处理children
    if (vnode.children) {
      if (typeof vnode.children === 'string') {
        // 这里默认最后一级的children的值为string   实际上还有可能是h()函数
        el.textContent = vnode.children
      } else {
        vnode.children.forEach(child => {
          // 再次调用Mount函数,此时的container就是el
          mount(child,el)
        })
      }
    }
    // 插入到父级元素
    container.appendChild(el)
  }
  mount(vdom,document.getElementById('app'))
</script>
```
