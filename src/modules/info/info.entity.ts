import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UsersEntity } from '../user/user.entity';


@Entity('infos')
export class InfoEntity {

    @PrimaryGeneratedColumn('increment')
    id: number;

    @ManyToOne(() => UsersEntity, (user) => user.id, {onDelete: 'CASCADE', onUpdate: 'CASCADE'})
    user: UsersEntity;

    @Column('varchar')
    info: string;

    @CreateDateColumn()
    infoDate: Date;

}