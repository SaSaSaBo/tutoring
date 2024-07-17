import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InOutService } from '../in-out.service';
import { UserService } from 'src/modules/user/user.service';

@Injectable()
export class AuthenticationService {

  constructor(
    private readonly inOutService: InOutService,
    private readonly userService: UserService,
  ) {}

  async login(userId: number, accessToken: string): Promise<void> {
    // Your existing login logic
    await this.inOutService.logAction(userId, 'login', accessToken);
  }

  async logout(userId: number, accessToken: string, ): Promise<void> {
      // Your existing logout logic
      await this.inOutService.logAction(userId, 'logout', accessToken);
  }

}