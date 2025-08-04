import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { UserEntity } from './user.entity';
import { PlayerShowCommentEntity } from './playershowcomment.entity';
import { ProductEntity } from './product.entity';

@Entity('player_show')
export class PlayerShowEntity {
  @PrimaryGeneratedColumn()
  id: number;

  // 所属用户
  @ManyToOne(() => UserEntity)
  user: UserEntity;

  @ManyToOne(() => ProductEntity)
  product: ProductEntity;

  @Column()
  title: string;

  // 玩家秀图文内容（可选）
  @Column({ type: 'text', nullable: true })
  content: string;

  // 多张照片用 JSON 数组存储
  @Column('simple-json')
  images: string[]; // 如 ["url1", "url2"]

  @Column({ default: 0 })
  likes: number;

  @CreateDateColumn()
  createTime: Date;

  // 评论列表（可选关联）
  @OneToMany(() => PlayerShowCommentEntity, comment => comment.playerShow)
  comments: PlayerShowCommentEntity[];
}
