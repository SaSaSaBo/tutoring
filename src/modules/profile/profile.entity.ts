import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UsersEntity } from '../user/user.entity';
import { PhoneVisibility } from '../enum/visibility.enum';

@Entity('profile')
export class ProfileEntity {
    
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => UsersEntity, user => user.username)
    username: UsersEntity;

    @Column({ nullable: true })
    name: string;

    @Column({ nullable: true })
    surname: string;
    
    @Column({ type: 'date', nullable: true })
    dateOfBirth: Date;

    @Column({ nullable: true })
    gender: string;

    @Column({ nullable: true })
    residence: string;

    @ManyToOne(() => UsersEntity, user => user.phone)
    phone: UsersEntity;

    @Column({
        type: 'enum',
        enum: PhoneVisibility,
        nullable: true,
        default: null,
      })
      phoneVisibility: PhoneVisibility | null;

    @ManyToOne(() => UsersEntity, user => user.email)
    email: UsersEntity;

    @Column({ nullable: true, default: false })
    activationFlag: boolean;

    ownerId: any;

}