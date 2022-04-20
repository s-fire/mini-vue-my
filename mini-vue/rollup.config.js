import path from 'path'
const packageFormats = process.env.FORMATS && process.env.FORMATS.split(',')
const sourcemap = process.env.SOURCE_MAP
const target = process.env.TARGET
import ts from "rollup-plugin-typescript2"
import json from "@rollup/plugin-json"
import {nodeResolve} from "@rollup/plugin-node-resolve"
import commonJs from "@rollup/plugin-commonjs"
// 找到需要打包的目录
const packagesDir = path.resolve(__dirname,'packages')
const packageDir = path.resolve(packagesDir,target)
const name = path.basename(packageDir) // 获取打包文件的名字

// 解析路径函数
const resolve = p => path.resolve(packageDir,p) // 以打包的目录解析

const outputConfig ={
  'esm-bundler':{
    file:resolve(`dist/${name}.bundler.js`),
    format:'es'
  },
  'cjs':{
    file:resolve(`dist/${name}.cjs.js`),
    format:'cjs'
  },
  'global':{
    file:resolve(`dist/${name}.global.js`),
    format:'iife'
  }
}
// 获取模块自带的package.json 解决命令行中没传formats
const pkg = require(resolve('package.json'))
// 获取打包的formats配置
const packageConfigFormats = packageFormats || pkg.buildOptions.formats

function createConfig(format,output) {
  output.sourcemap = sourcemap
  output.exports = 'named'
  let external = []
  if (format === 'global') {
    // global模式需要配置name
    output.name = pkg.buildOptions.name
  }else{
    // 开发模式下非global模式需要配置external 排除模块自身的依赖文件 
    external=[...Object.keys(pkg.dependencies)]
  }
  return {
    input:resolve('src/index.ts'),
    output,
    plugins:[
      json(),
      ts(),
      commonJs(),
      nodeResolve()
    ]
  }
}
// packageConfigFormats 得到的是一个数组['global','cjs']
export default packageConfigFormats.map(formats=>createConfig(formats,outputConfig[formats]))
