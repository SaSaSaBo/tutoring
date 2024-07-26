import { Body, Controller, Get, HttpException, HttpStatus, Post, Put, Req, UseGuards } from '@nestjs/common';
import { RoleGuard } from '../guards/role.guard';
import { PermissionGuard } from '../guards/permission.guard';
import { Permissions } from '../decorator/permission.decorator';
import { Roles } from '../decorator/role.decorator';
import { Role } from '../enum/role.enum';
import { UserRegisterDto } from '../dto/user/register.dto';
import { UserLoginDto } from '../dto/user/login.dto';
import { AuthService } from '../auth/auth.service';
import { AuthGuard } from '../guards/auth.guard';
import { CreateProfileDto } from '../dto/profile/create.dto';
import { ProfileService } from '../profile/profile.service';
import { UpdateProfileDto } from '../dto/profile/update.dto';

@Controller('auth')
export class AuthController {

    constructor(
        private authService: AuthService,
        private profileService: ProfileService,
    ) {}

    @Get()
    @UseGuards(AuthGuard, RoleGuard, PermissionGuard)
    @Permissions('view_users', 'view_user')
    @Roles(Role.Manager, Role.Teacher, Role.Student) 
    async findAll() {
      return this.authService.findAll();
    }
  
    @Post('register')
    async register(
      @Body() data: UserRegisterDto) {
      return this.authService.register(data);
    }  
  
    @Post('login')
    async login(
    @Body() data: UserLoginDto) {
        const user = await this.authService.login(data);
        return { success: true, message: 'User logged in successfully.', data: user };
    }

    @Post('profile')
    async profile(
      @Body() data: CreateProfileDto,
      @Req() req: Request
    ) {
      const authHeader = req.headers['authorization'];
      const accessToken = authHeader?.replace('Bearer ', '');

      console.log('Controller: Access Token:', accessToken);
        
      if (!accessToken) {
        throw new HttpException('Access token not provided', HttpStatus.UNAUTHORIZED);
      }
      
      return this.profileService.createProfile(data, accessToken);
    }

    @Put('update-profile')
    async updateProfile(
      @Body() data: UpdateProfileDto,
      @Req() req: Request
    ) {
      const authHeader = req.headers['authorization'];
      const accessToken = authHeader?.replace('Bearer ', '');
      return this.profileService.updateProfile(data, accessToken);
    }
    
    @Post('logout')
    async logout(
      @Body() data: UserLoginDto) {
      await this.authService.logout(data);
      return { success: true, message: 'User logged out successfully.' };
    }

}
