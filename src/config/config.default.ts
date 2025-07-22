import { MidwayConfig } from '@midwayjs/core';
import { UserEntity } from '../entity/user.entity';
import { join } from 'path';
import { ProductEntity } from '../entity/product.entity';
import { BlindBoxEntity } from '../entity/blindbox.entity';
import { OrderEntity } from '../entity/order.entity';

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
        entities: [UserEntity, ProductEntity, BlindBoxEntity, OrderEntity],
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
  oss: {
    client: {
      accessKeyId: 'LTAI5tNHkHLiGu6DUn3Tz4Ve',
      accessKeySecret: 'vWvstuPHWUfs8KukXfGLQi6sLeFqoS',
      bucket: 'cs231880351',
      endpoint: 'oss-cn-shanghai.aliyuncs.com',
      timeout: '60s', // 替换成你的 OSS 区域域名
    },
  },
  upload: {
    mode: 'file',
    tmpdir: join(__dirname, '../uploads'),
    whitelist: ['.png', '.jpg', '.jpeg'],
    fileSize: '5mb',
  },
} as MidwayConfig;
