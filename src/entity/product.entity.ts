import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { BlindBoxEntity } from './blindbox.entity';
import { DrawPositionEntity } from './drawposition.entitiy';

@Entity('product')
export class ProductEntity {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ unique: true })
  name: string;
  @Column()
  image: string;
  @Column()
  description: string;
  @Column({ default: 0 })
  price: number;
  @Column()
  rules: string;
  // 一对多关系：一个商品对应多个盲盒项
  @OneToMany(() => BlindBoxEntity, item => item.product, { cascade: true })
  blindBoxItems: BlindBoxEntity[];
  @OneToMany(() => DrawPositionEntity, position => position.product, {
    cascade: true,
  })
  drawPositions: DrawPositionEntity[];
}
