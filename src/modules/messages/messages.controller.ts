import { Controller, Post, Param, Body, UseGuards, Req } from '@nestjs/common';
import { MessageService } from './messages.service';
import { UserService } from '../user/user.service';
import { AuthGuard } from '../guards/auth.guard';

@Controller('messages')
export class MessageController {
  constructor(
    private messageService: MessageService,
    private usersService: UserService,
  ) {}

  @UseGuards(AuthGuard)
  @Post('send/:id')
  async sendMessage(@Req() req, @Param('id') id: number, @Body('content') content: string) {
    const sender = await this.usersService.findOne(req.user.username);
    const receiver = await this.usersService.findOneById(id);
    return this.messageService.sendMessage(sender, receiver, content);
  }
}
