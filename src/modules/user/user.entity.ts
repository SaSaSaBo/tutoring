import { BaseEntity, Column, DeleteDateColumn, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { CategoryEntity } from '../category/category.entity';
import { Role } from '../enum/role.enum';

@Entity('users')
export class UsersEntity extends BaseEntity {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50, nullable: false})
  username: string;

  @Column({ type: 'varchar', length: 50, nullable: false, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 13 }) 
  phone: string;  

  @Column({ type: 'varchar', length: 150, nullable: false })
  password: string;
  hashedPassword: string;

  @Column({
    type: 'enum',
    enum: Role,
    default: [Role.Student], 
  })
  roles: Role;

  @DeleteDateColumn({
    name: 'deleted_at',
    type: 'timestamp',
    nullable: true,
    default: null,
  })
  deletedAt: Date;

  @ManyToMany(() => CategoryEntity, category => category.users)
  @JoinTable({
    name: "usersToCats"
  })
  categories: CategoryEntity[];
  
  permissions: any;
  userId: any;

}