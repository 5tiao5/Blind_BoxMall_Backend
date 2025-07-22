import { Controller, Inject, Post, Files } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';
import { OssService } from '../service/oss.service';
import * as fs from 'fs';
@Controller('/upload')
export class UploadController {
  @Inject()
  ctx: Context;

  @Inject()
  ossService: OssService;

  // 单文件上传示例（前端使用 multipart/form-data 传文件）
  @Post('/image')
  async uploadImage(@Files('file') file: any) {
    if (!file || (Array.isArray(file) && file.length === 0)) {
      return { success: false, message: '未上传文件' };
    }
    // 兼容 file 为数组或对象
    const f = Array.isArray(file) ? file[0] : file;
    // 兼容 data 为 Buffer 或文件路径
    let buffer: Buffer;
    if (Buffer.isBuffer(f.data)) {
      buffer = f.data;
    } else if (typeof f.data === 'string') {
      buffer = fs.readFileSync(f.data);
    } else {
      return { success: false, message: '文件内容为空' };
    }
    const url = await this.ossService.uploadImage(f.filename, buffer);
    return {
      success: true,
      url,
    };
  }
}
