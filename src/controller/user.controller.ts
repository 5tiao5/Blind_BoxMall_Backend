import { Inject, Controller, Post, Body, Get } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';
import { UserService } from '../service/user.service';
import { JwtService } from '@midwayjs/jwt';
import { UserEntity } from '../entity/user.entity';
import { JwtMiddleware } from '../middleware/jwt.middleware';

@Controller('/user')
export class UserController {
  @Inject()
  ctx: Context;
  @Inject()
  jwtService: JwtService;
  @Inject()
  userService: UserService;
  @Post('/login')
  async login(@Body() body) {
    const { phone, password } = body;
    const user = await this.userService.findByPhone(phone);

    if (
      !user ||
      !(await this.userService.validatePassword(password, user.password))
    ) {
      return { success: false, message: '用户名或密码错误' };
    }

    const token = await this.jwtService.sign({
      id: user.id,
      username: user.username,
    });

    return {
      success: true,
      message: '登录成功',
      token,
    };
  }
  @Post('/register')
  async register(@Body() body) {
    return this.userService.register(body);
  }
  @Get('/profile', { middleware: [JwtMiddleware] })
  async getProfile() {
    const userId = this.ctx.user.id;
    const user = await this.userService.findById(userId);
    return {
      success: true,
      data: {
        username: user.username,
        introduction: user.introduction,
        address: user.address,
        avatar: user.avatar,
        balance: user.balance,
      },
    };
  }
  @Post('/update', { middleware: [JwtMiddleware] })
  async updateUser(@Body() body: Partial<UserEntity>) {
    const userId = this.ctx.user.id;
    const success = await this.userService.updateUserInfo(userId, body);

    return {
      success,
      message: success ? '用户信息更新成功' : '用户信息更新失败',
    };
  }
}
