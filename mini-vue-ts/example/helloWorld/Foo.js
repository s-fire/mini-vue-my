import { h,getCurrentInstance } from "../../lib/mini-vue.esm.js";
export const Foo = {
  setup(props,{emit}) {    const instance = getCurrentInstance()
    console.log('instance: ', instance);
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