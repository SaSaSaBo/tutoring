import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('classroom')
export class ClassroomEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    cr_name: string;

    @Column()
    capability: number;

}
