import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { CategoryEntity } from '../category/category.entity';

@Entity('transactions')
export class TransactionEntity {
  
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    transaction: string;

    @ManyToOne(() => CategoryEntity, (category) => category.categoryId, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
    category: CategoryEntity;

}