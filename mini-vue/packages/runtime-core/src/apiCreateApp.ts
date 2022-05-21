export function createAppApi(render) {
  return (rootComponent,rootProps)=>{
    const app ={
      mount(container){
        render()
      },
      use(){

      },
      mixin(){

      },
      component(){
        
      }
    }
    return app
  }
}