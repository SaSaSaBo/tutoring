import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Req, UseGuards, ValidationPipe } from '@nestjs/common';
import { ClassroomService } from './classroom.service';
import { CreateCRDto } from '../dto/classroom/create.dto';
import { UpdateCRDto } from '../dto/classroom/update.dto';
import { DeleteCRDto } from '../dto/classroom/delete.dto';
import { Role } from '../enum/role.enum';
import { RoleGuard } from '../guards/role.guard';
import { PermissionGuard } from '../guards/permission.guard';
import { AuthGuard } from '../guards/auth.guard';
import { Permissions } from '../decorator/permission.decorator';
import { Roles } from '../decorator/role.decorator';

@Controller('classroom')
export class ClassroomController {

    constructor(
        private crService: ClassroomService
    ) {}

    @UseGuards(AuthGuard, RoleGuard, PermissionGuard)
    @Permissions('view_crs')
    @Roles(Role.Manager, Role.Teacher, Role.SubTeacher)
    @Get()
    async getClassrooms() {
        console.log('Classrooms Controller Called');
        return this.crService.getClassrooms();
    }

    @UseGuards(AuthGuard, RoleGuard, PermissionGuard)
    @Permissions('create_class')
    @Roles(Role.Teacher, Role.SubTeacher)
    @Post('create')
    async createClassroom(
        @Body() createData: CreateCRDto,
        @Req() req: any,
    ) {
        const accessToken = req.headers.authorization.split(' ')[1];
        return this.crService.createClassroom(createData, accessToken);
    }

    @UseGuards(AuthGuard, RoleGuard, PermissionGuard)
    @Permissions('update_class')
    @Roles(Role.Teacher, Role.SubTeacher)
    @Put('update/:id')
    async updateClassroom(
      @Param('id', ParseIntPipe) id: number,
      @Body(ValidationPipe) updateData: UpdateCRDto,
      @Req() req: any,
    ) {
      const accessToken = req.headers.authorization.split(' ')[1];
      return this.crService.updateClassroom(id, updateData, accessToken);
    }
    @UseGuards(AuthGuard, RoleGuard, PermissionGuard)
    @Permissions('delete_class')
    @Roles(Role.Teacher, Role.SubTeacher)
    @Delete('delete')
    async deleteClassroom(@Body() deleteData: DeleteCRDto) {
        return this.crService.deleteClassroom(deleteData);
    }

}