import { Inject, Controller, Post, Body, Get } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';
import { UserService } from '../service/user.service';
import { JwtService } from '@midwayjs/jwt';

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
  @Get('/')
  async hello() {
    return 'hello world';
  }

}
