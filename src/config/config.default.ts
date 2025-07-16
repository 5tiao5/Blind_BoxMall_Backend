import { MidwayConfig } from '@midwayjs/core';
import {UserEntity} from "../entity/user.entity";

export default {
  keys: '1752129728115_1214',
  koa: {
    port: 7002,
  },
  typeorm: {
    dataSource: {
      default: {
        type: 'better-sqlite3',
        database: './data/database.sqlite',
        synchronize: true,
        logging: true,
        entities: [UserEntity],
      },
    },
  },
  jwt: {
    secret: 'mmx-jwt-secret-231880378',
    expiresIn: '24h', // 有效时间
  },
  bcrypt: {
    saltRounds: 13,
  },
  cors: {
    origin: '*', // 或指定允许的域名，如 'http://localhost:3000'
    allowMethods: 'GET,HEAD,PUT,POST,DELETE,PATCH,OPTIONS',
    credentials: true,
  },
} as MidwayConfig;
