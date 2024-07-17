import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UsersEntity } from '../user/user.entity';


@Entity('inOuts')
export class InOutEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => UsersEntity, (user) => user.id, {onDelete: 'CASCADE', onUpdate: 'CASCADE'})
    user: UsersEntity;

    @Column()
    inOut: string;

    @Column( { nullable: true } )
    inOutDate: Date;

    @Column({     
        nullable: true,
        default: null
    })
    accessToken: string;

    @CreateDateColumn({ nullable: true })
    accessExpiredDate: Date;

}