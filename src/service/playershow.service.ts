import { Inject, Provide } from '@midwayjs/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { PlayerShowEntity } from '../entity/playershow.entity';
import { PlayerShowCommentEntity } from '../entity/playershowcomment.entity';
import { ProductEntity } from '../entity/product.entity';
import { UserService } from './user.service';

@Provide()
export class PlayerShowService {
  @InjectEntityModel(PlayerShowEntity)
  playerShowRepo: Repository<PlayerShowEntity>;

  @InjectEntityModel(PlayerShowCommentEntity)
  commentRepo: Repository<PlayerShowCommentEntity>;

  @InjectEntityModel(ProductEntity)
  productRepo: Repository<ProductEntity>;

  @Inject()
  userService: UserService;

  /**
   * 创建玩家秀（新增关联商品）
   */
  async createPlayerShow(
    userId: number,
    productId: number,
    title: string,
    content: string,
    images: string[]
  ) {
    const user = await this.userService.findById(userId);
    if (!user) return { success: false, message: '用户不存在' };

    const product = await this.productRepo.findOne({
      where: { id: productId },
    });
    if (!product) return { success: false, message: '商品不存在' };

    const show = this.playerShowRepo.create({
      user,
      product,
      title,
      content,
      images,
      likes: 0,
    });

    const saved = await this.playerShowRepo.save(show);
    return { success: true, data: saved };
  }

  /**
   * 给玩家秀点赞
   */
  async likePlayerShow(showId: number) {
    const show = await this.playerShowRepo.findOne({ where: { id: showId } });
    if (!show) return { success: false, message: '玩家秀不存在' };

    show.likes += 1;
    await this.playerShowRepo.save(show);

    return { success: true, message: '点赞成功' };
  }

  /**
   * 添加评论
   */
  async addComment(userId: number, showId: number, content: string) {
    const user = await this.userService.findById(userId);
    const show = await this.playerShowRepo.findOne({ where: { id: showId } });

    if (!user || !show) {
      return { success: false, message: '用户或玩家秀不存在' };
    }

    const comment = this.commentRepo.create({
      user,
      playerShow: show,
      content,
    });

    const saved = await this.commentRepo.save(comment);
    return { success: true, data: saved };
  }

  /**
   * 获取所有玩家秀及评论
   */
  async getAllShows() {
    const shows = await this.playerShowRepo.find({
      order: { createTime: 'DESC' },
      relations: ['user', 'product', 'comments', 'comments.user'],
    });
    return { success: true, data: shows };
  }
}
