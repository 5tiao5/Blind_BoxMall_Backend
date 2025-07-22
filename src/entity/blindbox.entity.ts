import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { ProductEntity } from './product.entity';

@Entity('blind_box_item')
export class BlindBoxEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string; //物品名

  @Column()
  image: string; //图片url

  @Column({ type: 'float', default: 1.0 })
  probability: number; // 抽中概率

  @Column({ default: false })
  isDrawn: boolean; // 是否已被抽中

  @Column()
  serialNumber: string; // 编号，前端可展示
  // 多对一关系：多个盲盒项属于一个商品
  @ManyToOne(() => ProductEntity, product => product.blindBoxItems, {
    onDelete: 'CASCADE',
  })
  product: ProductEntity;
}
