function createVnode(tag,props,children) {
  const vNode ={
    tag,
    props,
    children
  }
  return vNode
}
export const h = createVnode