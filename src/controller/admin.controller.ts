// admin.controller.ts
import { Controller, Post, Body } from '@midwayjs/core';

@Controller('/admin')
export class AdminController {
  @Post('/login')
  async login(@Body('code') code: string) {
    const secretCode = 'mmx-181314-1'; // 管理员密钥验证
    if (code !== secretCode) {
      return { success: false, message: '身份码错误' };
    }
    return {
      success: true,
      message: '验证成功',
    };
  }
}
