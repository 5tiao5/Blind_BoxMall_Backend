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

  @Column({ default: 1 })
  probability: number; // 抽中概率
  @Column({ default: false })
  isTaken: boolean;
  // 多对一关系：多个盲盒项属于一个商品
  @ManyToOne(() => ProductEntity, product => product.blindBoxItems, {
    onDelete: 'CASCADE',
  })
  product: ProductEntity;
}
