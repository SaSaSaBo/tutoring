import { BaseEntity, Column, DeleteDateColumn, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { CategoryEntity } from '../category/category.entity';
import { Role } from '../enum/role.enum';
import { ClassroomEntity } from '../classroom/classroom.entity';

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
    name: "cat_user",
    joinColumn: {
        name: "usersId",
        referencedColumnName: "id"
    },
    inverseJoinColumn: {
        name: "categorysId",
        referencedColumnName: "id"
    }
})
  categories: CategoryEntity[];
  
  classrooms: any;
  permissions: any;
  userId: any;
  parentId: any
  parent: any
  name: any
  cat_user: any;
  createdCategories: any;
    blockedUsers: any;
    blockedBy: any;

}