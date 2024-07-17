import { CanActivate, ExecutionContext, Injectable, Logger, UnauthorizedException, ForbiddenException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as config from 'config';
@Injectable()
export class AuthGuard implements CanActivate {

  private readonly logger = new Logger(AuthGuard.name);

  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const jwtConfig = config.get('jwt');
    const secretOrPrivateKey = jwtConfig.secret;
    const request: Request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];
    if (!authHeader) {
      throw new UnauthorizedException('Authorization header missing');
    }

    const [bearer, token] = authHeader.split(' ');
    if (!token) {
      throw new UnauthorizedException('Token missing');
    }
    
    try {
      const decoded = await this.jwtService.verifyAsync(token, { secret: secretOrPrivateKey });
      
      request['user'] = decoded;
      return true;
    } catch (error) {
      console.log(error);
      
      console.error('Token verification failed', error); // Log the error for debugging
      throw new UnauthorizedException('Token verification failed');
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