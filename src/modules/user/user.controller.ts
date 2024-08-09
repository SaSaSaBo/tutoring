import { Body, Controller, Delete, Get, HttpCode, HttpException, HttpStatus, Param, ParseIntPipe, Post, Put, Query, Req, UseGuards, ValidationPipe } from '@nestjs/common';
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
import { ProfileService } from '../profile/profile.service';
import { PhoneActivationDto } from '../dto/activation/phone.dto';
import { EmailActivationDto } from '../dto/activation/email.dto';
import { ActivationService } from '../activation/activation.service';


@Controller('user')
export class UserController {

    constructor(
        private userService: UserService,
        private profileService: ProfileService,
        private activationService: ActivationService,
      ) {}

      @Get('all')
      @UseGuards(AuthGuard, RoleGuard, PermissionGuard)
      @Permissions('view_users')
      @Roles(Role.Manager)
      async findAll () {
        return this.profileService.findAll();
      }

      @Get('allDate')
      @UseGuards(AuthGuard, RoleGuard, PermissionGuard)
      @Permissions('view_users')
      @Roles(Role.Manager)
      async findAllDate(
        @Query('month') month?: number,
        @Query('year') year?: number,
      ) {
        return this.profileService.findAllDate(month, year);
      }
      
      @Get('findTeachAsM')
      @UseGuards(AuthGuard, RoleGuard, PermissionGuard)
      @Permissions('view_users')
      @Roles(Role.Manager)
      async findTeachAsM(
        @Query('city') city?: string,
        @Query('town') town?: string,
        @Query('name') name?: string,
        @Query('surname') surname?: string,
      ) {
        return this.profileService.findTeachAsM(city, town, name, surname);
      }

      @Get('blockedUsers')
      @UseGuards(AuthGuard, RoleGuard, PermissionGuard)
      @Permissions('view_users')
      @Roles(Role.Manager)
      async findBlockedUser() {
        return this.profileService.findBlockedUser();
      }


      @Get('teachers')
      @UseGuards(AuthGuard, RoleGuard, PermissionGuard)
      @Permissions('view_students')
      @Roles(Role.Teacher)
      async findAllStudents (
        @Req() req: Request
      ) {
        const authHeader = req.headers['authorization'];
        const accessToken = authHeader?.replace('Bearer ', '');
        return this.profileService.findAllStudents(accessToken);
      }

      @Get('students')
      @UseGuards(AuthGuard, RoleGuard, PermissionGuard)
      @Permissions('view_teachs')
      @Roles(Role.Student)
      async findAllTeachers () {
        return this.profileService.findAllTeachers();
      }

      @Get('students-teach')
      @UseGuards(AuthGuard, RoleGuard, PermissionGuard)
      @Permissions('view_teachs')
      @Roles(Role.Student)
      async callTeachers (
        @Req() req
      ) {
        const authHeader = req.headers['authorization'];
        const accessToken = authHeader?.replace('Bearer ', '');
        return this.profileService.callTeachers(accessToken);
      }

      @Post('join')
      @UseGuards(AuthGuard, RoleGuard, PermissionGuard)
      @Permissions('join_cat')
      @Roles(Role.Teacher)
      async joinCat(
        @Req() req,
        @Body() addUserToCatDto: AddUsersToCatsDto ) {
          const userId = req.user.sub;
        return this.userService.joinCat(addUserToCatDto, userId);
      }

      @Post('add/stdnt')
      @UseGuards(AuthGuard, RoleGuard, PermissionGuard)
      @Permissions('add_student')
      @Roles(Role.Teacher)
      async addStdntToClr(
        @Body() addData: AddStudentToClrDto, // DTO'yu burada alıyoruz
        @Req() req: Request // Request nesnesini alıyoruz
      ) {
        // Authorization başlığından accessToken'ı al
        const authHeader = req.headers['authorization'];
        const accessToken = authHeader?.replace('Bearer ', '');
    
        if (!accessToken) {
          throw new HttpException('Access token not provided', HttpStatus.UNAUTHORIZED);
        }
    
        // addStdntToClr metodunu çağır
        return this.userService.addStdntToClr(addData, accessToken);
      }

      @Post('activation-email')
      @HttpCode(HttpStatus.OK)
      async activationEmail(
        @Req() req: Request,
        @Body() emailActivationDto: EmailActivationDto) {
          const authHeader = req.headers['authorization'];
          const accessToken = authHeader?.replace('Bearer ', '');
        // Email aktivasyon işlemi
        const response = await this.activationService.activationEmail(emailActivationDto, accessToken);
        return response;
      }
    
      @Post('activation-phone')
      @HttpCode(HttpStatus.OK)
      async activationPhone(
        @Req() req: Request,
        @Body() phoneActivationDto: PhoneActivationDto) {
          const authHeader = req.headers['authorization'];
          const accessToken = authHeader?.replace('Bearer ', '');
        // Telefon aktivasyon işlemi
          const response = await this.activationService.activationPhone(phoneActivationDto, accessToken);
          return response;
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