import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UsersEntity } from '../user/user.entity';
import { Place } from '../enum/place.enum';
import { PhoneVisibility } from '../enum/visibility.enum';

@Entity('tprofile')
export class TProfileEntity {

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
    @Column({ nullable: true })
    alma_mater: string;

    @Column({ nullable: true })
    area: string;

    @Column({ type: 'text' })
    explanation: string;

    @Column({ 
        type: 'enum', 
        enum: Place, 
        default: Place.Online 
    })
    place: Place;

    @Column({ nullable: true, default: false })
    activationFlag: boolean;

    ownerId: any;
    classroom: any;
    priLes: any;

}