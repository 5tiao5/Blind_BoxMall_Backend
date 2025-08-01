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
    let positions = await this.drawPositionRepo.find({
      where: { product_id: productId },
      order: { boxIndex: 'ASC' },
    });

    // 如果没有就创建对应数量
    if (positions.length === 0) {
      const product = await this.productService.getProduct(productId);
      if (!product || !product.blindBoxItems) {
        throw new Error('商品或盲盒项不存在');
      }

      const newPositions = product.blindBoxItems.map((_, index) => {
        const pos = new DrawPositionEntity();
        pos.product_id = productId;
        pos.boxIndex = index;
        pos.isDrawn = false;
        return pos;
      });

      positions = await this.drawPositionRepo.save(newPositions);
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
      const pos = await this.drawPositionRepo.findOneBy({
        product_id: productId,
        boxIndex: index,
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
  async resetDrawnStatus(productId: number) {
    // 批量更新所有对应盲盒，将 isDrawn 设置为 false，orderId 设置为 null
    const result = await this.drawPositionRepo.update(
      { product_id: productId },
      {
        isDrawn: false,
        orderId: null,
      }
    );

    return {
      success: true,
      message: `已重置 ${result.affected} 个盲盒状态`,
    };
  }
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
