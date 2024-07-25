import { Body, Controller, Delete, Get, Param, Post, Put, Req, UseGuards } from '@nestjs/common';
import { CategoryService } from './category.service';
import { AddCategoryDto } from '../dto/category/add.dto';
import { UpdateCategoryDto } from '../dto/category/update.dto';
import { DeleteCategoryDto } from '../dto/category/delete.dto';
import { Role } from '../enum/role.enum';
import { RoleGuard } from '../guards/role.guard';
import { PermissionGuard } from '../guards/permission.guard';
import { AuthGuard } from '../guards/auth.guard';
import { Permissions } from '../decorator/permission.decorator';
import { Roles } from '../decorator/role.decorator';

@Controller('category')
export class CategoryController {

    constructor(
        private readonly categoryService: CategoryService,
    ) {}

    @UseGuards(AuthGuard, RoleGuard, PermissionGuard)
    @Permissions('view_cats')
    @Roles(Role.Manager, Role.Teacher)
    @Get()
    async getCategories() {
        return this.categoryService.getCategories();
    }

    @UseGuards(AuthGuard, RoleGuard, PermissionGuard)
    @Permissions('add_cat')
    @Roles(Role.Manager)
    @Post('add')
    async addCategories(
        @Body() addData: AddCategoryDto,
        @Req() req
    ) {
        console.log('Request Body:', addData);
        
        const userId = req.user.sub;

        console.log('User ID:', userId);
        
        const category = await this.categoryService.addCategories(addData, userId);
        return {
            success: true,
            data: {
              statusCode: 200,
              message: 'Category added',
              id: category.id,
            },
        };
    }

    @UseGuards(AuthGuard, RoleGuard, PermissionGuard)
    @Permissions('update_cat')
    @Roles(Role.Manager)
    @Put('update/:id')
    async updateCategories(
        @Param('id') id: number, 
        @Body() updateData: UpdateCategoryDto) {
        return this.categoryService.updateCategories(id, updateData);
    }

    @UseGuards(AuthGuard, RoleGuard, PermissionGuard)
    @Permissions('delete_cat')
    @Roles(Role.Manager)
    @Delete('delete')
    async deleteCategories(@Body() deleteData: DeleteCategoryDto) {
        return this.categoryService.deleteCategories(deleteData);
    }

}
