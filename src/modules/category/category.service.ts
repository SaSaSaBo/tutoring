/* eslint-disable no-useless-escape */
/* eslint-disable no-unused-vars */
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AddCategoryDto } from '../dto/category/add.dto';
import { UpdateCategoryDto } from '../dto/category/update.dto';
import { TransactionEntity } from '../transaction/transaction.entity';
import { DeleteCategoryDto } from '../dto/category/delete.dto';
import { TransactionService } from '../transaction/transaction.service';
import { CategoryEntity } from './category.entity';

@Injectable()
export class CategoryService {

    constructor(
        @InjectRepository(CategoryEntity) 
        private readonly catRepository: Repository<CategoryEntity>,

        private transactionService: TransactionService
    ) {}

    async getCategories() {
        console.log('Categories Service Called');
        return await this.catRepository.find();
    }    
    
    async addCategories(addData: AddCategoryDto): Promise<CategoryEntity> {
        const { name, definement, status, parentId } = addData;

        const category = new CategoryEntity();
        category.name = name;
        category.definement = definement;
        category.status = status !== undefined ? status : true;
        category.parent = parentId ? await this.catRepository.findOneBy({ id: parentId }) : null;

        return await this.catRepository.save(category);
    }

    async updateCategories(id: number, updateData: UpdateCategoryDto) {
        try {
            const category = await this.catRepository.findOneBy({ id: id });
            console.log(category);
            

            if (!category) {
                throw new NotFoundException('Category not found!');
            }

            const updateMessage = [];
            const log = new TransactionEntity();
            log.category = category;

            if (updateData.new_name) {
                const isNameTaken = await this.catRepository.findOne({ where: { name: updateData.new_name } });
                if (isNameTaken && isNameTaken.id !== category.id) {
                    throw new Error("Category name already exists!");
                }
                updateMessage.push('Category name updated!');
                log.transaction = log.transaction ? `${log.transaction} Category name updated.` : 'Category name updated.';
            }

            if (updateData.new_definement) {
                updateMessage.push('Category definement updated!');
                log.transaction = log.transaction ? `${log.transaction} Category definement updated.` : 'Category definement updated.';
            }

            if (updateData.new_parentId) {
                updateMessage.push('Category\'s parentId is updated!');
                log.transaction = log.transaction ? `${log.transaction} Category\'s parentId is updated!` : 'Category\'s parentId is updated!';
            }

            // Update category entity
            category.name = updateData.new_name || category.name;
            category.definement = updateData.new_definement || category.definement;
            category.parent = updateData.new_parentId ? await this.catRepository.findOneBy({ id: updateData.new_parentId }) : null;

            await this.catRepository.save(category);

            if (log.transaction) {
                await this.transactionService.addLog(log);
            }

            return {
                statusCode: 200,
                message: updateMessage.length > 0 ? updateMessage.join(' ') : 'Category updated',
            };

        } catch (error) {
            throw new Error(error.message);
        }
    }

    async deleteCategories(deleteData: DeleteCategoryDto) {
        const { name } = deleteData; 

        try {
            const category = await this.catRepository.findOneBy({ name: name, deletedAt: null });
            if (!category) {
                throw new NotFoundException('Category not found!');
            }

            if (deleteData.softDelete === true) {
                category.deletedAt = new Date();
                await this.catRepository.save(category);
                return 'Category was deleted with soft delete!';
            } else {
                await this.catRepository.remove(category);
                return 'Category was deleted with hard delete!';
            }
        } catch (error) {
            if (error instanceof NotFoundException || error instanceof BadRequestException) {
                throw error;
              } else {
                throw new Error('An error occurred while deleting the category!');
              }
        }
    }

}
