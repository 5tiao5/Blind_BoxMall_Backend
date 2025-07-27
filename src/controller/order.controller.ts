import { Controller, Get, Inject } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';
import { OrderService } from '../service/order.service';

@Controller('/order')
export class OrderController {
  @Inject() ctx: Context;
  @Inject()
  orderService: OrderService;
  @Get('/all')
  async getMyOrders() {
    const userId = this.ctx.user.id;
    return this.orderService.getUserOrders(userId);
  }
}
