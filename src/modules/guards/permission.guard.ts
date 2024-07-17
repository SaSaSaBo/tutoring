import { CanActivate, ExecutionContext, Injectable, Logger, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { roles } from '../enum/role.enum';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class PermissionGuard implements CanActivate {
  
  private readonly logger = new Logger(PermissionGuard.name);

  constructor(private reflector: Reflector, private jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
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

            // Add permission for read operation (GET request)
            if (requiredPermissions.includes('view_users') && (userRole === 'manager' || userRole === 'teacher')) {
              // Allow read operation
              return true;
            }

                  // Add permission for read operation (GET request)
      if (requiredPermissions.includes('view_cats') && (userRole === 'manager' || userRole === 'teacher')) {
        // Allow read operation
        return true;
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

/*
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { getPermissionsFromRole } from '../auth/auth.service';// İthalat yolunu buna göre ayarlayın

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.get<string[]>('permissions', context.getHandler());
    if (!requiredPermissions) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    const userPermissions = getPermissionsFromRole(user.roles);

    return requiredPermissions.every(permission => userPermissions.includes(permission));
  }
}
*/