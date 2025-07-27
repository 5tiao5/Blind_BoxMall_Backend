import { Provide } from '@midwayjs/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { BlindBoxEntity } from '../entity/blindbox.entity';
import { Repository } from 'typeorm';

@Provide()
export class BlindBoxService {
  @InjectEntityModel(BlindBoxEntity)
  blindBoxRepo: Repository<BlindBoxEntity>;

  async markAsDrawn(box: BlindBoxEntity) {
    console.log(box + '开始标记');
    return this.blindBoxRepo.update({ id: box.id }, { isDrawn: true });
  }

  async releaseBlindBox(box: BlindBoxEntity) {
    box.isDrawn = false;
    return this.blindBoxRepo.save(box);
  }

  async findById(id: number) {
    return this.blindBoxRepo.findOneBy({ id });
  }

  async getAvailableBoxesByProductId(productId: number) {
    console.log('getAvailableBoxesByProductId开始' + 'id是：' + productId);
    return this.blindBoxRepo.find({
      where: { product: { id: productId }, isDrawn: false },
    });
  }
  async drawRandomBlindBox(productId: number): Promise<BlindBoxEntity | null> {
    const boxes = await this.getAvailableBoxesByProductId(productId);

    if (!boxes.length) return null;

    // 计算总概率
    const totalProb = boxes.reduce((sum, box) => sum + box.probability, 0);
    const rand = Math.random() * totalProb;

    let cumulative = 0;
    for (const box of boxes) {
      cumulative += box.probability;
      if (rand <= cumulative) {
        console.log(box.id);
        return box;
      }
    }

    // 防止浮点误差导致没选中
    return boxes[boxes.length - 1];
  }
  async drawMultipleBlindBoxes(
    productId: number,
    count: number
  ): Promise<BlindBoxEntity[]> {
    const boxes = await this.getAvailableBoxesByProductId(productId);

    if (boxes.length === 0 || count === 0) return [];

    const drawnBoxes: BlindBoxEntity[] = [];

    // 从可用盲盒中随机抽取
    for (let i = 0; i < count; i++) {
      const box = await this.drawRandomBlindBox(productId);
      if (box) {
        drawnBoxes.push(box);
        // 标记为已抽中
        await this.markAsDrawn(box);
      }
    }

    return drawnBoxes;
  }
  async resetDrawnStatus(
    productId: number
  ): Promise<{ success: boolean; message: string }> {
    try {
      // 查找所有该商品的盲盒
      const positions = await this.blindBoxRepo.find({
        where: { product: { id: productId } },
      });

      // 如果盲盒不存在，返回错误信息
      if (positions.length === 0) {
        return { success: false, message: '没有找到对应的盲盒数据' };
      }

      // 使用 TypeORM 的更新操作重置所有盲盒状态
      await this.blindBoxRepo.update(
        { product: { id: productId } }, // 条件
        { isDrawn: false } // 更新值
      );
      return { success: true, message: '所有盲盒状态已重置' };
    } catch (error) {
      console.error(error);
      return { success: false, message: '重置盲盒状态时出错' };
    }
  }
}
