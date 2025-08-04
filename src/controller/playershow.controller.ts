import { Body, Controller, Get, Inject, Param, Post } from '@midwayjs/core';
import { PlayerShowService } from '../service/playershow.service';
import { JwtMiddleware } from '../middleware/jwt.middleware';
import { Context } from '@midwayjs/koa';

@Controller('/playershow')
export class PlayerShowController {
  @Inject()
  playerShowService: PlayerShowService;
  @Inject() ctx: Context;
  @Post('/create', { middleware: [JwtMiddleware] })
  async create(@Body() body) {
    const { productId, title, content, images } = body;
    const userId = this.ctx.user.id;

    if (!productId || !title || !Array.isArray(images)) {
      return {
        success: false,
        message: '缺少必要字段 productId、title 或 images',
      };
    }

    return this.playerShowService.createPlayerShow(
      userId,
      productId,
      title,
      content,
      images
    );
  }

  @Post('/like/:id')
  async like(@Param('id') id: number) {
    return this.playerShowService.likePlayerShow(id);
  }

  @Post('/comment', { middleware: [JwtMiddleware] })
  async comment(@Body() body) {
    const { showId, content } = body;
    const userId = this.ctx.user.id;
    return this.playerShowService.addComment(userId, showId, content);
  }

  @Get('/all')
  async getAll() {
    return this.playerShowService.getAllShows();
  }
}
