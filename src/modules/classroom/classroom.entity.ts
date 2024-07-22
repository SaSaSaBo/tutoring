import { Column, DeleteDateColumn, Entity, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UsersEntity } from '../user/user.entity';
import { Exclude } from 'class-transformer';
import { CategoryEntity } from '../category/category.entity';

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

    @ManyToOne(() => CategoryEntity, category => category.classrooms)
    category: CategoryEntity; // Change to singular

    @DeleteDateColumn({
        name: 'deleted_at',
        type: 'timestamp',
        nullable: true,
        default: null,
    })
    deletedAt: Date;
  classroomId: any;
}
