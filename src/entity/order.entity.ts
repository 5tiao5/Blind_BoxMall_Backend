import { UserEntity } from './user.entity';
import { ProductEntity } from './product.entity';
import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BlindBoxEntity } from './blindbox.entity';

@Entity('order')
export class OrderEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => UserEntity)
  user: UserEntity;

  @ManyToOne(() => ProductEntity)
  product: ProductEntity;

  @ManyToOne(() => BlindBoxEntity)
  blindBox: BlindBoxEntity;

  @Column({ default: 'pending' })
  status: 'pending' | 'paid' | 'cancelled' | 'completed';

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  createTime: Date;

  @Column({ type: 'datetime', nullable: true })
  payTime: Date;

  @Column({ type: 'datetime', nullable: true })
  arriveTime: Date;
}
