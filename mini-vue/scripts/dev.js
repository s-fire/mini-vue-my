const minimist = require("minimist")
const execa = require('execa')
// 获取所输入的命令
const args = minimist(process.argv.slice(2))
const target = args.length ? args._[0] : 'reactivity'
console.log('target: ', target);
const format = args.f || 'global'
const sourcemap = args.s || false

// 启动打包子进程
execa("rollup",[
  '-wc', // --wathc --config
  '--environment',
  [
    `TARGET:${target}`,
    `FORMATS:${format}`,
    sourcemap ? `SOURCE_MAP:true` : ""
  ].filter(Boolean).join(',') // 过滤掉sourcemap为false时的空字符串
],{
  stdio:'inherit' //将子进程的输出在控制台进行输出
})