import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, DeleteDateColumn } from 'typeorm';
import { UsersEntity } from '../user/user.entity';

@Entity('requests')
export class RequestEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => UsersEntity)
  requester: UsersEntity;

  @ManyToOne(() => UsersEntity)
  requestee: UsersEntity;

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
