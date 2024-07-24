import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { UsersEntity } from '../user/user.entity';

@Entity('block')
export class BlockEntity {
  
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => UsersEntity, user => user.blockedUsers)
  blocker: UsersEntity;

  @ManyToOne(() => UsersEntity, user => user.blockedBy)
  blocked: UsersEntity;

  @CreateDateColumn()
  blockedDate: Date;

  @Column({ nullable: true })
  unblockedDate: Date;
  
}
