import { Provide } from '@midwayjs/core';
import * as OSS from 'ali-oss';

@Provide()
export class OssService {
  ossClient: OSS;

  constructor() {
    this.ossClient = new OSS({
      accessKeyId: 'LTAI5tM1kDK15iqbEkc2KweP', //'LTAI5tNHkHLiGu6DUn3Tz4Ve'
      accessKeySecret: 'mT3evB3wCnQO0FBZ0MPXveaYSGt3pi', //'vWvstuPHWUfs8KukXfGLQi6sLeFqoS',
      bucket: 'cs231880351',
      region: 'oss-cn-shanghai',
      endpoint: 'oss-cn-shanghai.aliyuncs.com',
      timeout: '60s',
    });
  }

  async uploadImage(filename: string, buffer: Buffer) {
    const result = await this.ossClient.put(`images/${filename}`, buffer);
    return result.url;
  }
}
