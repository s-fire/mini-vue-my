// import path from 'path'
const packageFormats = process.env.FORMATS && process.env.FORMATS.split(',')
const sourcemap = process.env.SOURCE_MAP
const target = process.env.TARGET

// 找到需要打包的目录
// const packagesDir = path.resolve(__dirname,'packages')
// const packageDir = path.resolve(packagesDir,)
console.log(packageFormats,sourcemap,target);