import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { RoleGuard } from '../guards/role.guard';
import { PermissionGuard } from '../guards/permission.guard';
import { Permissions } from '../decorator/permission.decorator';
import { Roles } from '../decorator/role.decorator';
import { Role } from '../enum/role.enum';
import { UserRegisterDto } from '../dto/user/register.dto';
import { UserLoginDto } from '../dto/user/login.dto';
import { AuthService } from '../auth/auth.service';
import { AuthGuard } from '../guards/auth.guard';

@Controller('auth')
export class AuthController {

    constructor(
        private authService: AuthService,
    ) {}

    @Get()
    @UseGuards(AuthGuard, RoleGuard, PermissionGuard)
    @Permissions('view_users')
    @Roles(Role.Manager, Role.Teacher) 
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
    
    @Post('logout')
    async logout(
      @Body() data: UserLoginDto) {
      await this.authService.logout(data);
      return { success: true, message: 'User logged out successfully.' };
    }

}
