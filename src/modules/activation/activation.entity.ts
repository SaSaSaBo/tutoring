import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UsersEntity } from '../user/user.entity';

@Entity('activation')
export class ActivationEntity {
  
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => UsersEntity, (user) => user.userId, { eager: true })
    user: UsersEntity;

    @Column({nullable: true})
    activationLink: string;

    @Column({nullable: true})
    activationEmailDate: Date;

    @Column({nullable: true})
    activationCode: string;

    @Column({nullable: true})
    activationPhoneDate: Date;    
    
}
