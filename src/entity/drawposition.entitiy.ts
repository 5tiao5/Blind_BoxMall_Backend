import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ProductEntity } from './product.entity';

@Entity('draw_position')
export class DrawPositionEntity {
  @PrimaryGeneratedColumn()
  id: number;

  // 商品 ID
  @ManyToOne(() => ProductEntity, product => product.drawPositions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'product_id' })
  product: ProductEntity;

  // 对应商品的第几个盲盒位置（如第5个格子）
  @Column()
  boxIndex: number;

  // 是否已被抽中
  @Column({ default: false })
  isDrawn: boolean;

  // （可选）关联订单号
  @Column({ nullable: true })
  orderId: number;
}
