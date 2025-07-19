import { UserEntity } from './user.entity';
import { ProductEntity } from './product.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
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

  @OneToOne(() => BlindBoxEntity)
  @JoinColumn()
  blindBox: BlindBoxEntity;

  @Column({ default: 'unpaid' }) // unpaid, paid, canceled, arrived
  status: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createTime: Date;

  @Column({ type: 'timestamp', nullable: true })
  payTime: Date;

  @Column({ type: 'timestamp', nullable: true })
  arriveTime: Date;
}
