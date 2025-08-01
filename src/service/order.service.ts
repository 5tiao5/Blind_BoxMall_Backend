import { Provide, Inject } from '@midwayjs/core';
import { OrderEntity } from '../entity/order.entity';
import { BlindBoxEntity } from '../entity/blindbox.entity';
import { Repository } from 'typeorm';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { UserService } from './user.service';
import { ProductService } from './product.service';
import { BlindBoxService } from './blindbox.service';
import { DrawPositionService } from './drawposition.service'; // ✅ 使用你的 ProductService

@Provide()
export class OrderService {
  @InjectEntityModel(OrderEntity)
  orderRepo: Repository<OrderEntity>;
  @Inject()
  blindBoxService: BlindBoxService;
  @Inject()
  userService: UserService;
  @Inject()
  drawPositionService: DrawPositionService;
  @Inject()
  productService: ProductService; // ✅ 注入 ProductService

  async createOrder(
    userId: number,
    productId: number,
    blindBox: BlindBoxEntity
  ) {
    // 标记盲盒为已抽中
    await this.blindBoxService.markAsDrawn(blindBox);

    const order = this.orderRepo.create({
      user: { id: userId },
      product: { id: productId },
      blindBox,
      status: 'pending',
      createTime: new Date(),
    });
    return this.orderRepo.save(order);
  }

  async payOrder(orderId: number, userId: number) {
    const order = await this.orderRepo.findOne({
      where: { id: orderId },
      relations: ['user', 'product', 'blindBox'],
    });

    if (!order || order.user.id !== userId) {
      return { success: false, message: '订单不存在或无权限' };
    }

    if (order.status !== 'pending') {
      return { success: false, message: '订单状态异常' };
    }

    const user = await this.userService.findById(userId);
    const product = await this.productService.getProduct(order.product.id);
    if (!user || !product) {
      return { success: false, message: '用户或商品不存在' };
    }

    if (user.balance < product.price) {
      return { success: false, message: '余额不足' };
    }

    user.balance -= product.price;
    await this.userService.updateUserInfo(userId, { balance: user.balance });

    order.status = 'paid';
    order.payTime = new Date();
    await this.orderRepo.save(order);

    return { success: true, message: '支付成功' };
  }

  async cancelOrder(orderId: number, userId: number) {
    const order = await this.orderRepo.findOne({
      where: { id: orderId },
      relations: ['user', 'blindBox'],
    });

    if (!order || order.user.id !== userId) {
      return { success: false, message: '订单不存在或无权限' };
    }

    if (order.status !== 'pending') {
      return { success: false, message: '当前订单状态不可取消' };
    }

    order.status = 'cancelled';
    await this.orderRepo.save(order);
    await this.drawPositionService.resetDrawPositionByOrderId(orderId);
    if (order.blindBox) {
      await this.blindBoxService.releaseBlindBox(order.blindBox);
    }

    return { success: true, message: '订单已取消' };
  }
  async drawAndCreateOrder(userId: number, productId: number) {
    const product = await this.productService.getProduct(productId);
    if (!product) {
      return { success: false, message: '商品不存在' };
    }

    const box = await this.blindBoxService.drawRandomBlindBox(productId);
    if (!box) {
      return { success: false, message: '盲盒已售罄' };
    }

    // 标记为已抽中
    await this.blindBoxService.markAsDrawn(box);

    const order = this.orderRepo.create({
      user: { id: userId },
      product: { id: productId },
      blindBox: box,
      status: 'pending',
      createTime: new Date(),
    });

    await this.orderRepo.save(order);
    return {
      success: true,
      message: '抽奖成功，订单已生成',
      data: {
        orderId: order.id,
        blindBox: {
          id: box.id,
          name: box.name,
          image: box.image,
          serialNumber: box.serialNumber,
        },
      },
    };
  }
  async drawMultipleAndCreateOrders(
    userId: number,
    productId: number,
    count: number
  ) {
    const product = await this.productService.getProduct(productId);
    if (!product) {
      return { success: false, message: '商品不存在' };
    }

    const boxes = await this.blindBoxService.drawMultipleBlindBoxes(
      productId,
      count
    );
    if (boxes.length === 0) {
      return { success: false, message: '盲盒已售罄或抽奖失败' };
    }

    // 批量创建订单
    const orders = await Promise.all(
      boxes.map(box => {
        const order = this.orderRepo.create({
          user: { id: userId },
          product: { id: productId },
          blindBox: box,
          status: 'pending',
          createTime: new Date(),
        });
        return this.orderRepo.save(order);
      })
    );

    return {
      success: true,
      message: '抽奖成功，订单已生成',
      data: orders.map(order => ({
        orderId: order.id,
        blindBox: {
          id: order.blindBox.id,
          name: order.blindBox.name,
          image: order.blindBox.image,
          serialNumber: order.blindBox.serialNumber,
        },
      })),
    };
  }
  async getUserOrders(userId: number) {
    const orders = await this.orderRepo.find({
      where: { user: { id: userId } },
      relations: ['product', 'blindBox'],
      order: { createTime: 'DESC' },
    });
    return { success: true, data: orders };
  }
  async refundOrder(orderId: number, userId: number) {
    const order = await this.orderRepo.findOne({
      where: { id: orderId },
      relations: ['user', 'product', 'blindBox'],
    });
    if (!order || order.user.id !== userId) {
      return { success: false, message: '订单不存在或无权限' };
    }
    if (order.status !== 'paid') {
      return { success: false, message: '订单不可退款（状态异常）' };
    }
    // 计算时间差
    const createTime = new Date(order.createTime);
    const payTime = new Date(order.payTime);
    const diffInMs = payTime.getTime() - createTime.getTime();
    const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

    if (diffInDays > 3) {
      return { success: false, message: '已超过可退款时间（3天）' };
    }
    // 加回余额
    const user = await this.userService.findById(userId);
    user.balance += order.product.price;
    await this.userService.updateUserInfo(userId, { balance: user.balance });
    // 订单设为取消
    order.status = 'cancelled';
    await this.orderRepo.save(order);
    // 释放盲盒状态
    await this.drawPositionService.resetDrawPositionByOrderId(orderId);
    if (order.blindBox) {
      await this.blindBoxService.releaseBlindBox(order.blindBox);
    }
    return { success: true, message: '退款成功' };
  }
  async getUserOrdersPaged(userId: number, page: number, pageSize: number) {
    const [data, total] = await this.orderRepo.findAndCount({
      where: { user: { id: userId } },
      order: { createTime: 'DESC' },
      relations: ['product', 'blindBox'],
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return {
      success: true,
      data,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }
}
