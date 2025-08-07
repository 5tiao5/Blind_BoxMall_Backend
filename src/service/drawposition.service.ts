import { Provide, Inject } from '@midwayjs/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { DrawPositionEntity } from '../entity/drawposition.entitiy';
import { ProductService } from './product.service';

@Provide()
export class DrawPositionService {
  @InjectEntityModel(DrawPositionEntity)
  drawPositionRepo: Repository<DrawPositionEntity>;

  @Inject()
  productService: ProductService;

  /**
   * 获取商品盲盒位置状态，如果没有则创建
   */
  async getOrCreateDrawPositions(productId: number) {
    const positions = await this.drawPositionRepo.find({
      where: { product: { id: productId } },
      order: { boxIndex: 'ASC' },
      relations: ['product'], // 确保可以访问 product.id
    });

    if (positions.length === 0) {
      const product = await this.productService.getProduct(productId);
      if (!product || !product.blindBoxItems) {
        throw new Error('商品或盲盒项不存在');
      }

      const newPositions = product.blindBoxItems.map((_, index) => {
        const pos = new DrawPositionEntity();
        pos.product = product; // 👈 设置整个实体，而不是 product_id
        pos.boxIndex = index;
        pos.isDrawn = false;
        return pos;
      });

      return await this.drawPositionRepo.save(newPositions);
    }

    return positions;
  }

  /**
   * 批量设置 boxIndex 为已抽中
   */
  async markAsDrawn(
    productId: number,
    boxIndexes: number[] | number,
    orderId: number
  ) {
    const indexes = Array.isArray(boxIndexes) ? boxIndexes : [boxIndexes];
    const updated: DrawPositionEntity[] = [];

    for (const index of indexes) {
      const pos = await this.drawPositionRepo.findOne({
        where: {
          product: { id: productId },
          boxIndex: index,
        },
        relations: ['product'],
      });

      if (pos && !pos.isDrawn) {
        pos.isDrawn = true;
        pos.orderId = orderId;
        updated.push(pos);
      }
    }

    if (updated.length > 0) {
      await this.drawPositionRepo.save(updated);
    }

    return { success: true, updatedCount: updated.length };
  }

  /**
   * 重置某个商品的所有抽中状态
   */
  async resetDrawnStatus(productId: number) {
    const positions = await this.drawPositionRepo.find({
      where: { product: { id: productId } },
      relations: ['product'],
    });

    for (const pos of positions) {
      pos.isDrawn = false;
      pos.orderId = null;
    }

    await this.drawPositionRepo.save(positions);

    return {
      success: true,
      message: `已重置 ${positions.length} 个盲盒状态`,
    };
  }

  /**
   * 根据订单 ID 重置对应盲盒状态
   */
  async resetDrawPositionByOrderId(orderId: number) {
    const drawPosition = await this.drawPositionRepo.findOne({
      where: { orderId },
    });

    if (!drawPosition) {
      return { success: true, message: '无需修改盲盒状态' };
    }

    drawPosition.isDrawn = false;
    drawPosition.orderId = null;
    await this.drawPositionRepo.save(drawPosition);

    return { success: true, message: '盲盒状态已重置' };
  }
}
