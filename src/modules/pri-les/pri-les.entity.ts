import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UsersEntity } from '../user/user.entity';

@Entity('priLes')
export class PriLesEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => UsersEntity, user => user.priLes)
    @JoinColumn({
        name: 'requester',
    })
    requester: UsersEntity; // İstek atan kullanıcı
    
    @Column({ length: 100 })
    pri_les: string; // İstek açıklaması

    @ManyToOne(() => UsersEntity, user => user.priLes, { nullable: true })
    @JoinColumn({
      name: 'accepter',
    })
    accepter: UsersEntity | null; 

}
