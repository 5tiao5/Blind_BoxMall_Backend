import { Controller, Post, Body } from '@midwayjs/decorator';
import { DrawPositionService } from '../service/drawposition.service';
import { Get, Inject, Param } from '@midwayjs/core';
import { OrderService } from '../service/order.service';
import { Context } from '@midwayjs/koa';
import { JwtMiddleware } from '../middleware/jwt.middleware';
import { BlindBoxService } from '../service/blindbox.service';
@Controller('/draw')
export class DrawController {
  @Inject()
  private drawPositionService: DrawPositionService;
  @Inject()
  private orderService: OrderService;
  @Inject()
  private blindBoxService: BlindBoxService;
  /**
   * 批量标记抽中（传入商品 ID 和抽中的盲盒位置索引）
   * POST /draw/mark?productId=xxx
   * body: { indexes: [1, 5, 9] }
   */
  @Inject()
  ctx: Context;
  @Post('/mark', { middleware: [JwtMiddleware] })
  async markBoxesAsDrawn(
    @Body('productId') productId: number,
    @Body('indexes') indexes: number[] // 前端传：{ indexes: [0, 1, 2] }
  ) {
    if (!Array.isArray(indexes)) {
      return { success: false, message: 'indexes 应为数组' };
    }
    const userId = this.ctx.user.id;
    if (indexes.length <= 1) {
      console.log(indexes[0] + '在创建订单之前');
      console.log('产品id是' + productId);
      const res = await this.orderService.drawAndCreateOrder(userId, productId);
      console.log(res + '创建订单之后');
      if (res.success) {
        const orderId = res.data.orderId;
        return this.drawPositionService.markAsDrawn(
          productId,
          indexes,
          orderId
        );
      } else {
        console.log(res);
      }
    } else {
      const res = await this.orderService.drawMultipleAndCreateOrders(
        userId,
        productId,
        indexes.length
      );
      for (let i = 0; i < indexes.length; i++) {
        await this.drawPositionService.markAsDrawn(
          productId,
          indexes[i],
          res.data[i].orderId
        );
      }
      return res;
    }
  }
  @Get('/:productId')
  async getStatus(@Param('productId') pid: number) {
    const list = await this.drawPositionService.getOrCreateDrawPositions(pid);
    return {
      success: true,
      data: list.map(item => ({
        index: item.boxIndex,
        isDrawn: item.isDrawn,
      })),
    };
  }
  @Post('/reset/:productId')
  async resetDrawPosition(@Param('productId') pid: number) {
    try {
      await this.drawPositionService.resetDrawnStatus(pid);
      await this.blindBoxService.resetDrawnStatus(pid);
      return { success: true, message: '重置盲盒状态成功' };
    } catch (error) {
      console.log(error);
      return { success: false, message: '重置盲盒状态时出错' };
    }
  }
}
