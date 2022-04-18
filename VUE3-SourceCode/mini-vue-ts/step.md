1. npm init
2. npm i typescript --dev
3. npx tsc --init  // 自动生成默认tsconfig.json
4. npm i jest @types/jest --dev
5. npm i babel-jest @babel/core @babel/preset-env --dev
6. npm i @babel/preset-typescript
7. babel.config.js
  module.exports = {
    presets: [
      ['@babel/preset-env', {targets: {node: 'current'}}],
      '@babel/preset-typescript',
    ],
  };
8. 修改tsconfig.json "lib": ["DOM","es6"],