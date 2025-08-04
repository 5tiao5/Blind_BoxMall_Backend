import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { UserEntity } from './user.entity';
import { PlayerShowEntity } from './playershow.entity';

@Entity('player_show_comment')
export class PlayerShowCommentEntity {
  @PrimaryGeneratedColumn()
  id: number;

  // 评论所属用户
  @ManyToOne(() => UserEntity)
  user: UserEntity;

  // 评论所属玩家秀
  @ManyToOne(() => PlayerShowEntity, playerShow => playerShow.comments)
  playerShow: PlayerShowEntity;

  @Column('text')
  content: string;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  createTime: Date;
}
