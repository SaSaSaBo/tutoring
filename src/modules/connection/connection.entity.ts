import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn } from 'typeorm';
import { UsersEntity } from '../user/user.entity';

@Entity('connection')
export class ConnectionEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => UsersEntity)
  requester: UsersEntity;

  @ManyToOne(() => UsersEntity)
  requestee: UsersEntity;

  @Column({ type: 'text'})
  pre_message: string;

  @Column({ default: false })
  accepted: boolean;

  @CreateDateColumn()
  createDate: Date;

}
