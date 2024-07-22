/*
import { BeforeInsert, Column, DeleteDateColumn, Entity, JoinColumn, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { UsersEntity } from '../user/user.entity';
import { ClassroomEntity } from '../classroom/classroom.entity';

@Entity('categorys')
export class CategoryEntity {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column('text')
  definement: string;

  @Column({ default: true })
  status: boolean;

  @ManyToOne(() => CategoryEntity, category => category.childCategories, { nullable: true })
  parent: CategoryEntity;    
  @OneToMany(() => CategoryEntity, category => category.parent)
  childCategories: CategoryEntity[];
    
  @DeleteDateColumn({
      name: 'deleted_at',
      type: 'timestamp',
      nullable: true,
      default: null,
  })
  deletedAt: Date;
  
  @ManyToMany(() => UsersEntity, user => user.categories)
  users: UsersEntity;

  @ManyToOne(() => UsersEntity, user => user.createdCategories)
  @JoinColumn({ name: 'createdBy' })
  createdBy: UsersEntity;

  @OneToMany(() => ClassroomEntity, classroom => classroom.categoryId)
  classrooms: ClassroomEntity[];
  
  @BeforeInsert()
  setDefaultParent() {
    if (this.status === undefined) {
      this.status = true;
    }
    if (!this.status) {
      this.parent = null;
    }
  }

  categoryId: any

}
  */
import { BeforeInsert, Column, DeleteDateColumn, Entity, JoinColumn, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { UsersEntity } from '../user/user.entity';
import { ClassroomEntity } from '../classroom/classroom.entity';

@Entity('categorys')
export class CategoryEntity {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column('text')
  definement: string;

  @Column({ default: true })
  status: boolean;

  @ManyToOne(() => CategoryEntity, category => category.childCategories, { nullable: true })
  parent: CategoryEntity;    

  @OneToMany(() => CategoryEntity, category => category.parent)
  childCategories: CategoryEntity[];
    
  @DeleteDateColumn({
      name: 'deleted_at',
      type: 'timestamp',
      nullable: true,
      default: null,
  })
  deletedAt: Date;
  
  @ManyToMany(() => UsersEntity, user => user.categories)
  users: UsersEntity;

  @ManyToOne(() => UsersEntity, user => user.createdCategories)
  @JoinColumn({ name: 'createdBy' })
  createdBy: UsersEntity;

  @OneToMany(() => ClassroomEntity, classroom => classroom.category)
  classrooms: ClassroomEntity[]; // Ensure correct relationship
    categoryId: any;

  @BeforeInsert()
  setDefaultParent() {
    if (this.status === undefined) {
      this.status = true;
    }
    if (!this.status) {
      this.parent = null;
    }
  }
}
