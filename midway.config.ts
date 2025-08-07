import { MidwayConfig } from '@midwayjs/core';

export default {
  sourceRoot: 'src', // 源码目录
  buildRoot: 'dist', // 编译输出目录
  entryFile: 'bootstrap.js', // 入口文件，与你的 src/configuration.ts 保持一致
  framework: '@midwayjs/koa',
} as MidwayConfig;
