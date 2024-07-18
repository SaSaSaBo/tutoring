import { Column, DeleteDateColumn, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { UsersEntity } from '../user/user.entity';

@Entity('classroom')
export class ClassroomEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    cr_name: string;

    @Column()
    capability: number;

    @DeleteDateColumn({
        name: 'deleted_at',
        type: 'timestamp',
        nullable: true,
        default: null,
    })
    deletedAt: Date;

    @ManyToMany(() => UsersEntity, user => user.classrooms)
    users: UsersEntity[];
    
    categoryId: any;

}