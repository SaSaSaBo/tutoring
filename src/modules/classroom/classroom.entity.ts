import { Column, CreateDateColumn, DeleteDateColumn, Entity, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
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

    @ManyToOne(() => CategoryEntity, category => category.classrooms, {onDelete: 'CASCADE'})
    category: CategoryEntity; // Change to singular

    @CreateDateColumn()
    created_at: Date;    

    @DeleteDateColumn({
        name: 'deleted_at',
        type: 'timestamp',
        nullable: true,
        default: null,
    })
    deletedAt: Date;
  classroomId: any;
}
