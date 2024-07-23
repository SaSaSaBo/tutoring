import { Controller, Post, Param, UseGuards, Req } from '@nestjs/common';
import { ConnectionService } from './connection.service';
import { UserService } from '../user/user.service';
import { AuthGuard } from '../guards/auth.guard';

@Controller('connections')
export class ConnectionController {
  constructor(
    private connectionService: ConnectionService,
    private usersService: UserService,
  ) {}

  @UseGuards(AuthGuard)
  @Post('request/:id')
  async sendRequest(@Req() req, @Param('id') id: number) {
    const requester = await this.usersService.findOne(req.user.username);
    const requestee = await this.usersService.findOneById(id);
    return this.connectionService.sendRequest(requester, requestee);
  }

  @UseGuards(AuthGuard)
  @Post('accept/:id')
  async acceptRequest(@Param('id') id: number) {
    return this.connectionService.acceptRequest(id);
  }
}
