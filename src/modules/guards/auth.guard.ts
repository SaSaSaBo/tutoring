import { CanActivate, ExecutionContext, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as config from 'config';

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly logger = new Logger(AuthGuard.name);

  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const jwtConfig = config.get('jwt');
    const secretOrPrivateKey = jwtConfig.secret;
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];

    if (!authHeader) {
      this.logger.warn('Authorization header missing');
      throw new UnauthorizedException('Authorization header missing');
    }

    const [bearer, token] = authHeader.split(' ');
    if (bearer !== 'Bearer' || !token) {
      this.logger.warn('Invalid authorization header format');
      throw new UnauthorizedException('Invalid authorization header format');
    }

    try {
      const decoded = await this.jwtService.verifyAsync(token, { secret: secretOrPrivateKey });
      request.user = decoded; // req.user'ı ayarla
      return true;
    } catch (error) {
      this.logger.error('Token verification failed', error.stack);
      throw new UnauthorizedException('Token verification failed');
    }
  }
}
