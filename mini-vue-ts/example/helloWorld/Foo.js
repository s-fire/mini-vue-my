import { h } from "../../lib/mini-vue.esm.js";
export const Foo = {
  setup(props,{emit}) {
    console.log('props: ', props);
    const emitAdd = ()=>{
      console.log('clickEmitAdd');
      emit('add',1,2)
      emit('add-foo')
    }
    return {
      emitAdd
    }
  },
  render(){
    const btn = h('button',{
      onClick:this.emitAdd
    },'emitAdd')
    const foo = h('div',{},'foo:'+this.count)
    return h('div',{},[foo,btn])
  }
}