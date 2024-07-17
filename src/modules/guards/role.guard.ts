import { Role } from "../enum/role.enum";
import { AuthService } from "../auth/auth.service";
import { CanActivate, ExecutionContext, Injectable, Logger } from "@nestjs/common";
import { Reflector } from "@nestjs/core";

@Injectable()
export class RoleGuard implements CanActivate {

  private readonly logger = new Logger(RoleGuard.name);

  constructor(private reflector: Reflector, private authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    this.logger.log('RoleGuard was called...');

    const requiredRoles = this.reflector.getAllAndOverride<Role[]>('roles', [context.getHandler(), context.getClass()]);
    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const userId = request.user?.sub;

    if (!userId) {
      this.logger.warn('User ID not found in request');
      return false;
    }

    const user = await this.authService.findOneById(userId);
    if (!user) {
      this.logger.warn('User not found');
      return false;
    }

    this.logger.log(`User roles: ${user.roles}`);
    return requiredRoles.some(role => user.roles.includes(role));
  }
}