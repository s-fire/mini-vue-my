1. 安装pnpm
2. 添加.npmrc文件 配置node_modules 包扁平化
3. 添加pnpm.workspace.yaml文件 配置Monorepo工作区间
4. pnpm install typescript rollup rollup-plugin-typescript2 @rollup/plugin-json @rollup/plugin-node-resolve @rollup/plugin-commonjs minimist execa@4 -D -W
5. pnpm tsc --init
   ```javascript
  {
    "compilerOptions": {
      "target": "es2016", // 目标语法
      "lib": ["esnext","dom"], // 支持的类库
      "jsx": "preserve", // jsx不转义
      "module": "esnext", // 模块格式
      "moduleResolution": "node", // 模块解析方式
      "resolveJsonModule": true, // 解析json模块
      "sourceMap": true,
      "outDir": "dist",                                   
      "esModuleInterop": true, // 允许通过es6的语法引入commonJs模块
      "strict": true,
    }
  }
  ```
6. 在package里新建reactivity和shard文件夹并配置package.json
7. 在reactivity里安装同目录下的shared pnpm install @vue/shared@workspace --filter @vue/reactivity
8. 解决文件引入路劲问题 修改tsconfig.json文件
  ```javascript
  {
    "compilerOptions": {
      "target": "es2016", // 目标语法
      "lib": ["esnext","dom"], // 支持的类库
      "jsx": "preserve", // jsx不转义
      "module": "esnext", // 模块格式
      "moduleResolution": "node", // 模块解析方式
      "resolveJsonModule": true, // 解析json模块
      "sourceMap": true,
      "outDir": "dist",                                   
      "esModuleInterop": true, // 允许通过es6的语法引入commonJs模块
      "strict": true,
      "baseUrl": ".", //以当前路劲为基准查找
      "paths": {
        "@vue/*":["packages/*/src"]
      }
    }
  }
  ```
9. 新建scripts/dev.js文件  该文件为运行开发环境的脚本文件
```javascript
```
10. 配置package.json里的脚本命令
11. 新建rollup.config.js文件