import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ unique: true })
  username: string;
  @Column()
  password: string;
  @Column({ unique:  true})
  phone: number;
  @Column({ nullable: true })
  introduction: string;
  @Column({ nullable: true })
  avatar: string;
  @Column({ default: 1000 })
  balance: number;
}
