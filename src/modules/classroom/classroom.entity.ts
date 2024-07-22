import { Column, DeleteDateColumn, Entity, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { UsersEntity } from '../user/user.entity';
import { Exclude } from 'class-transformer';

@Entity('classroom')
export class ClassroomEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    cr_name: string;

    @Column()
    capability: number;

    @ManyToOne(() => UsersEntity, user => user.classrooms, { eager: false })
    @Exclude()
    creator: UsersEntity;

    @DeleteDateColumn({
        name: 'deleted_at',
        type: 'timestamp',
        nullable: true,
        default: null,
    })
    deletedAt: Date;

    categoryId: any;
    classroomId: any;

}