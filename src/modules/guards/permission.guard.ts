import { CanActivate, ExecutionContext, Injectable, Logger, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { roles } from '../enum/role.enum';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { CategoryService } from '../category/category.service';

@Injectable()
export class PermissionGuard implements CanActivate {
  
  private readonly logger = new Logger(PermissionGuard.name);

  constructor(
    private reflector: Reflector,
    private jwtService: JwtService,
    private usersService: UserService,
    private categoriesService: CategoryService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>('permissions', [
      context.getHandler(),
      context.getClass(),
    ]) || [];

    this.logger.log('PermissionGuard called...');

    if (!requiredPermissions.length) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      this.logger.warn('No token found');
      return false;
    }

    try {
      const decodedToken = this.jwtService.decode(token) as { role: string, sub: number };
      const userRole = decodedToken.role;
      const userId = decodedToken.sub;
      const requestedUserId = +request.params.id;
      const body = request.body;

      console.log('User role: ' + userRole, 'User ID: ' + userId);

      const userPermissions = roles[userRole];
      if (!userPermissions) {
        this.logger.error('User permissions not found for role:', userRole);
        return false;
      }

      this.logger.log(`User permissions: ${userPermissions}`);

      if (requiredPermissions.includes('update_own_profile') && requestedUserId === userId) {
        if (body.role && body.role !== userRole) {
          throw new ForbiddenException('You cannot change your own role.');
        }
        return true;
      }

      if (requiredPermissions.includes('update_users')) {
        if (userRole === 'manager') {
          return true;
        }
      }

      if (requiredPermissions.includes('delete_own_profile') && requestedUserId === userId) {
        return true;
      }

      if (requiredPermissions.includes('delete_users') && (userRole === 'manager')) {
        return true;
      }

      if (requiredPermissions.includes('view_users') && (userRole === 'manager' || userRole === 'teacher' || userRole === 'sub_teacher')) {
        return true;
      }

      if (requiredPermissions.includes('view_user') && (userRole === 'student')) {
        return true;
      }

      if (requiredPermissions.includes('view_cats') && (userRole === 'manager' || userRole === 'teacher')) {
        return true;
      }

      // Eklenen Kod: Classroom açma izni kontrolü
      if (requiredPermissions.includes('create_classroom')) {
        const userCategories = await this.usersService.getUserCategories(userId);
        if (userRole === 'teacher' || userRole === 'sub_teacher') {
          if (userCategories.length === 0) {
            this.logger.warn('Teacher or sub_teacher cannot create classroom without a category');
            return false;
          }
          if (userRole === 'sub_teacher') {
            const userClassrooms = await this.usersService.getUserClassrooms(userId);
            if (userClassrooms.length >= 1) {
              this.logger.warn('Sub_teacher cannot create more than one classroom');
              return false;
            }
          }
          return true;
        }
      }

      const hasPermission = requiredPermissions.every(permission => userPermissions.includes(permission));
      if (!hasPermission) {
        this.logger.warn('Insufficient permissions.');
        return false;
      }

      return true;
    } catch (err) {
      this.logger.error("Error decoding JWT token:", err);
      return false;
    }
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const authHeader = request.headers['authorization'];
    if (!authHeader) {
      return undefined;
    }
    const [bearer, token] = authHeader.split(' ');
    return bearer === 'Bearer' ? token : undefined;
  }
}
