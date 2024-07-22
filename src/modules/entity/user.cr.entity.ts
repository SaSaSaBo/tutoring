// src/user_cr/user_cr.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { UsersEntity } from '../user/user.entity';
import { ClassroomEntity } from '../classroom/classroom.entity';

@Entity('user_cr')
export class UserCrEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => UsersEntity, (user) => user.userId)
    userId: UsersEntity;

    @ManyToOne(() => ClassroomEntity, (classroom) => classroom.classroomId)
    classroomId: ClassroomEntity;

    @Column()
    addedBy: number; 

}
