// src/user_cr/user_cr.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { UsersEntity } from '../user/user.entity';
import { ClassroomEntity } from '../classroom/classroom.entity';

@Entity('user_cr')
export class UserCrEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => UsersEntity, (user) => user.userId, {onDelete: 'CASCADE'})
    @JoinColumn({
      name: "user_id",
    })
    user: UsersEntity;

    @ManyToOne(() => ClassroomEntity, (classroom) => classroom.classroomId,{onUpdate:"CASCADE",onDelete:"CASCADE"})
    classroom: ClassroomEntity;

    @ManyToOne(() => UsersEntity, (user) => user.userId)
    @JoinColumn({
      name: "added_by",
    })
    addedBy: UsersEntity; 

}
