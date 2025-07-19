import { Controller, Get, Inject } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';

@Controller('/order')
export class OrderController {
  @Inject() ctx: Context;

  @Get('/my')
  async getMyOrders() {
    const orders = '待实现';
    return {
      success: true,
      orders,
    };
  }
}
