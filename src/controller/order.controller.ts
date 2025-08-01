import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Post,
  Query,
} from '@midwayjs/core';
import { Context } from '@midwayjs/koa';
import { OrderService } from '../service/order.service';
import { JwtMiddleware } from '../middleware/jwt.middleware';

@Controller('/order')
export class OrderController {
  @Inject() ctx: Context;
  @Inject()
  orderService: OrderService;
  @Get('/all', { middleware: [JwtMiddleware] })
  async getMyOrders() {
    const userId = this.ctx.user.id;
    return this.orderService.getUserOrders(userId);
  }
  @Post('/pay/:id', { middleware: [JwtMiddleware] })
  async pay(@Param('id') id: number) {
    const userId = this.ctx.user.id;
    return this.orderService.payOrder(id, userId);
  }
  @Post('/mutipay', { middleware: [JwtMiddleware] })
  async mutipay(@Body() indexes: number[]) {
    const userId = this.ctx.user.id;
    for (const index of indexes) {
      const res = await this.orderService.payOrder(index, userId);
      if (!res.success) {
        return {
          success: false,
          message: '订单编号:' + index.toString() + ' ' + res.message,
        };
      }
    }
    return { success: true, message: '全部订单支付成功' };
  }
  @Post('/refund', { middleware: [JwtMiddleware] })
  async refund(@Body() indexes: number[]) {
    const userId = this.ctx.user.id;
    for (const index of indexes) {
      const res = await this.orderService.refundOrder(index, userId);
      if (!res.success) {
        return {
          success: false,
          message: '订单编号:' + index.toString() + ' ' + res.message,
        };
      }
    }
    return { success: true, message: '全部订单退款成功' };
  }
  @Post('/cancel', { middleware: [JwtMiddleware] })
  async cancel(@Body() indexes: number[]) {
    const userId = this.ctx.user.id;
    for (const index of indexes) {
      const res = await this.orderService.cancelOrder(index, userId);
      if (!res.success) {
        return {
          success: false,
          message: '订单编号:' + index.toString() + ' ' + res.message,
        };
      }
    }
    return { success: true, message: '全部订单取消成功' };
  }
  @Get('/page', { middleware: [JwtMiddleware] })
  async getOrderPage(@Query() query) {
    const userId = this.ctx.user.id;
    const page = Number(query.page) || 1;
    const pageSize = Number(query.pageSize) || 10;

    return this.orderService.getUserOrdersPaged(userId, page, pageSize);
  }
}
