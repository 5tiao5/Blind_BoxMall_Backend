import { Middleware, Inject, IMiddleware } from '@midwayjs/core';
import { Context, NextFunction } from '@midwayjs/koa';
import { JwtService } from '@midwayjs/jwt';

@Middleware()
export class JwtMiddleware implements IMiddleware<Context, NextFunction> {
  @Inject()
  jwtService: JwtService;

  resolve() {
    return async (ctx: Context, next: NextFunction) => {
      const authHeader = ctx.get('Authorization');
      const token = authHeader?.replace(/^Bearer\s/, '');

      if (!token) {
        ctx.status = 401;
        ctx.body = { success: false, message: '缺少授权令牌' };
        return;
      }

      try {
        const decoded = await this.jwtService.verify(token);
        ctx.user = decoded; // 保存用户信息到上下文
        await next();
      } catch (err) {
        ctx.status = 401;
        ctx.body = { success: false, message: '无效或过期的令牌' };
      }
    };
  }

  static getName(): string {
    return 'jwt'; // 中间件名称
  }
}
