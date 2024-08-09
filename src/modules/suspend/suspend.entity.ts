import { Column, CreateDateColumn, DeleteDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UsersEntity } from '../user/user.entity';

@Entity('suspend')
export class SuspendEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => UsersEntity, user => user.suspend)    
    suspendId: UsersEntity;

    @CreateDateColumn()
    suspendDate: Date;
    
    @CreateDateColumn({default: null, nullable: true})
    unSuspendDate: Date;

    @DeleteDateColumn({
        name: 'deleted_at',
        type: 'boolean',
        nullable: true,
        default: false,
    })
    deletedAt: boolean;

}
