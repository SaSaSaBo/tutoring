import { Body, Controller, Delete, HttpException, HttpStatus, Param, ParseIntPipe, Post, Put, Req, UseGuards, ValidationPipe } from '@nestjs/common';
import { UserUpdateDto } from '../dto/user/update.dto';
import { UsersDeleteDto } from '../dto/user/delete.dto';
import { UserService } from './user.service';
import { AuthGuard } from '../guards/auth.guard';
import { RoleGuard } from '../guards/role.guard';
import { PermissionGuard } from '../guards/permission.guard';
import { Role } from '../enum/role.enum';
import { AddUsersToCatsDto } from '../dto/user/add.user.to.cat.dto';
import { Permissions } from '../decorator/permission.decorator';
import { Roles } from '../decorator/role.decorator';
import { AddStudentToClrDto } from '../dto/user/add.student.to.clr.dto';


@Controller('user')
export class UserController {

    constructor(
        private userService: UserService,
      ) {}
    
      @Post('add')
      @UseGuards(AuthGuard, RoleGuard, PermissionGuard)
      @Permissions('add_users_to_cat')
      @Roles(Role.Manager)
      async addUserToCat(
        @Body() addUserToCatDto: AddUsersToCatsDto ) {
        return this.userService.addUserToCat(addUserToCatDto);
      }

      @Post('add/stdnt')
      @UseGuards(AuthGuard, RoleGuard, PermissionGuard)
      @Permissions('add_student')
      @Roles(Role.Teacher, Role.SubTeacher)
      async addStdntToClr(
        @Body() addData: AddStudentToClrDto,
        @Req()  accessToken: string
      ) {
        return this.userService.addStdntToClr(addData, accessToken);
      }
    
      @Put('update/:id')
      @UseGuards(AuthGuard, RoleGuard, PermissionGuard)
      @Permissions('update_own_profile', 'update_users')
      @Roles(Role.Manager, Role.Student)
      async update(
        @Param('id', ParseIntPipe) id: number,
        @Body(ValidationPipe) data: UserUpdateDto){
          return this.userService.update(id, data);
        }
    
      @Delete('delete')
      @UseGuards(AuthGuard, RoleGuard, PermissionGuard)
      @Permissions('delete_users')
      @Roles(Role.Manager)
      async delete(
        @Body(ValidationPipe) deleteUserDto: UsersDeleteDto): Promise<{ message: string }> {
        try {
          const message = await this.userService.delete(deleteUserDto);
          return { message };
        } catch (error) {
          throw new HttpException({
            status: HttpStatus.BAD_REQUEST,
            error: error.message,
          }, HttpStatus.BAD_REQUEST);
        }
      }
    

}