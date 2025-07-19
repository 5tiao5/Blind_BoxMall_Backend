import { Configuration, App } from '@midwayjs/core';
import * as koa from '@midwayjs/koa';
import * as validate from '@midwayjs/validate';
import * as info from '@midwayjs/info';
import * as orm from '@midwayjs/typeorm';
import { join } from 'path';
import * as jwt from '@midwayjs/jwt';
import * as cors from '@koa/cors';
// import { DefaultErrorFilter } from './filter/default.filter';
// import { NotFoundFilter } from './filter/notfound.filter';
import * as oss from '@midwayjs/oss';
import * as swagger from '@midwayjs/swagger';
import * as upload from '@midwayjs/upload';
//import { JwtMiddleware } from './middleware/jwt.middleware';

@Configuration({
  imports: [
    koa,
    validate,
    orm,
    {
      component: info,
      enabledEnvironment: ['local'],
    },
    {
      component: swagger,
      enabledEnvironment: ['local'],
    },
    jwt,
    upload,
    oss,
  ],
  importConfigs: [join(__dirname, './config')],
})
export class MainConfiguration {
  @App('koa')
  app: koa.Application;

  async onReady() {
    // add middleware
    // this.app.useMiddleware([JwtMiddleware]);
    this.app.use(
      cors({
        origin: '*',
        credentials: true,
        allowMethods: ['GET', 'POST', 'OPTIONS'],
      })
    );
    // add filter
    // this.app.useFilter([NotFoundFilter, DefaultErrorFilter]);
  }
}
