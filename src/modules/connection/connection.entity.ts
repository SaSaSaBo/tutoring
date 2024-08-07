import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, DeleteDateColumn } from 'typeorm';
import { UsersEntity } from '../user/user.entity';

@Entity('connection')
export class ConnectionEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => UsersEntity)
  requester: UsersEntity;

  @ManyToOne(() => UsersEntity)
  requestee: UsersEntity;

  @Column({ type: 'text', nullable: true })
  pre_message: string;

  @Column({ default: false, nullable: true })
  accepted: boolean;

  @CreateDateColumn()
  createDate: Date;

  @DeleteDateColumn({
    name: 'deleted_at',
    type: 'timestamp',
    nullable: true,
    default: null,
  })
  deletedAt: Date;

}