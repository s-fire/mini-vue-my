import { h } from "../../lib/mini-vue.esm.js";
import { Foo } from "./Foo.js";
window.self = null;
export const App = {
  name: "APP",
  render() {
    window.self = this;
    return h(
      "div",
      {
        id: "root",
        class: ["red", "hard"],
        // onClick() {
        //   console.log("click");
        // },
        // onMousedown() {
        //   console.log("mouseDown");
        // },
      },
      [
        h("div", {}, "hi " + this.msg),
        h(Foo, {
          count: 1,
          onAdd(a, b) {
            console.log("onAdd", a, b);
          },
          onAddFoo(){
            console.log("onAddFoo");
          }
        }),
      ]
      // 'hi '+this.msg
      // string
      // "hi,mini-vue"
      // array
      // [h('p', {
      //   class: ["red"],
      // },'hi'),h('p', {
      //   class: ["green"],
      // },'mini-vue')]
    );
  },
  setup() {
    return {
      msg: "mini-vue1",
    };
  },
};
