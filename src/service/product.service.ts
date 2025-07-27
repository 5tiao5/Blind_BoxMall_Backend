import { Provide } from '@midwayjs/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { ProductEntity } from '../entity/product.entity';
import { BlindBoxEntity } from '../entity/blindbox.entity';
import { Repository } from 'typeorm';
import { CreateProductDTO } from '../dto/create-product.dto';
import { UpdateProductDTO } from '../dto/update-product.dto';
import { DrawPositionEntity } from '../entity/drawposition.entitiy';

@Provide()
export class ProductService {
  @InjectEntityModel(ProductEntity)
  productRepo: Repository<ProductEntity>;

  @InjectEntityModel(BlindBoxEntity)
  blindBoxRepo: Repository<BlindBoxEntity>;
  @InjectEntityModel(DrawPositionEntity)
  drawPositionRepo: Repository<DrawPositionEntity>;
  async createProductWithBlindBoxes(data: CreateProductDTO) {
    const product = new ProductEntity();
    product.name = data.name;
    product.description = data.description;
    product.image = data.image;
    product.price = data.price;
    product.rules = data.rules;

    // 创建盲盒对象数组并赋值到 product 上（cascade 插入）
    product.blindBoxItems = data.blindBoxItems.map(item => {
      const box = new BlindBoxEntity();
      box.name = item.name;
      box.image = item.image;
      box.probability = item.probability;
      box.serialNumber = item.serialNumber;
      return box;
    });
    // 创建 DrawPositionEntity 并赋值到 product.drawPositions 上
    const drawPositions = data.blindBoxItems.map((item, index) => {
      const drawPosition = new DrawPositionEntity();
      drawPosition.product = product; // 直接将商品与 DrawPosition 关联
      drawPosition.product_id = product.id; // 关联商品ID
      drawPosition.boxIndex = index; // 当前是第几个盲盒（序号）
      drawPosition.isDrawn = false; // 初始状态：未被抽中
      return drawPosition;
    });
    // 将 drawPositions 赋值给 product.drawPositions
    product.drawPositions = drawPositions;
    // 保存商品及盲盒项
    const savedProduct = await this.productRepo.save(product);
    // 批量保存 DrawPositionEntity
    await this.drawPositionRepo.save(drawPositions);

    return savedProduct;
  }
  async updateProduct(dto: UpdateProductDTO) {
    console.log('DTO:', dto);

    if (isNaN(dto.id)) throw new Error('非法的产品 ID');
    if (typeof dto.price !== 'number') throw new Error('价格必须是数字');
    dto.blindBoxItems.forEach((item, i) => {
      if (typeof item.probability !== 'number' || isNaN(item.probability)) {
        throw new Error(`第 ${i} 个盲盒概率非法`);
      }
    });
    const product = await this.productRepo.findOne({
      where: { id: dto.id },
      relations: ['blindBoxItems'],
    });

    if (!product) throw new Error('商品不存在');

    // 只更新传入的字段
    if (dto.name !== undefined) product.name = dto.name;
    if (dto.image !== undefined) product.image = dto.image;
    if (dto.description !== undefined) product.description = dto.description;
    if (dto.price !== undefined) product.price = dto.price;
    if (dto.rules !== undefined) product.rules = dto.rules;
    // 更新盲盒项（如果有传）
    if (dto.blindBoxItems) {
      product.blindBoxItems = dto.blindBoxItems.map(item => {
        const box = new BlindBoxEntity();
        if (item.id) box.id = item.id;
        box.name = item.name;
        box.image = item.image;
        box.serialNumber = item.serialNumber;
        box.probability = item.probability;
        box.product = product;
        return box;
      });
    }
    await this.productRepo.save(product);
    return { success: true };
  }

  async deleteProduct(id: number) {
    const product = await this.productRepo.findOne({ where: { id } });
    if (!product) throw new Error('商品不存在');

    await this.productRepo.remove(product); // 会自动级联删除盲盒（cascade: true）

    return { success: true };
  }
  async getProduct(id: number) {
    return this.productRepo.findOne({
      where: { id },
      relations: ['blindBoxItems'],
    });
  }
  async findAll() {
    const products = await this.productRepo.find({
      relations: ['blindBoxItems'], // 👈 加载盲盒关联
      order: {
        id: 'ASC',
      },
    });
    return products;
  }
}
