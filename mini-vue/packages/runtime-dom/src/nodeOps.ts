// 节点操作集合

export const nodeOps ={
  // 插入元素
  insert:(child:HTMLElement,parent:HTMLElement,anchor:HTMLElement = null)=>{
    parent.insertBefore(child,anchor)
  },
  remove:(child:HTMLElement) =>{
    const parent = child.parentNode
    if (parent) {
      parent.removeChild(child)
    }
  },
  createElement: (tag: any)=> document.createElement(tag),
  createText:(text:string)=> document.createTextNode(text),
  setElementText:(el:HTMLElement,text:string) => el.textContent = text,
  setText:(node: { nodeValue: string },text:string) => node.nodeValue = text,
  parentNode:(node:HTMLElement)=>node.parentNode,
  nextSibling:(node:HTMLElement)=>node.nextSibling,
  querySelector:(selector: any)=>document.querySelector(selector)
}