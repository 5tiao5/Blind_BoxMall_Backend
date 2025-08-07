import { Provide } from '@midwayjs/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../entity/user.entity';
import * as bcrypt from 'bcryptjs';
@Provide()
export class UserService {
  @InjectEntityModel(UserEntity)
  userRepo: Repository<UserEntity>;

  async findByPhone(phone: number): Promise<UserEntity> {
    return await this.userRepo.findOneBy({ phone });
  }
  async findById(id: number): Promise<UserEntity> {
    return await this.userRepo.findOneBy({ id: id });
  }

  async validatePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
  async register(data: { username: string; phone: number; password: string }) {
    const { username, phone, password } = data;

    // 1. 检查用户名/手机号是否已存在
    const existUser = await this.userRepo.findOne({
      where: [{ username }, { phone }],
    });
    if (existUser) {
      return { success: false, message: '用户名或手机号已被注册' };
    }

    // 2. 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. 保存用户
    const user = this.userRepo.create({
      username,
      phone,
      password: hashedPassword,
    });
    await this.userRepo.save(user);

    return { success: true, message: '注册成功' };
  }
  async updateUserInfo(id: number, updateData: Partial<UserEntity>) {
    const result = await this.userRepo.update(id, updateData);
    return result.affected === 1;
  }
}
