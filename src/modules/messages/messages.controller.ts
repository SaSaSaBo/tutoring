import { Controller, Post, Param, Body, UseGuards, Req, ForbiddenException, Delete } from '@nestjs/common';
import { MessageService } from './messages.service';
import { UserService } from '../user/user.service';
import { AuthGuard } from '../guards/auth.guard';
import { Permissions } from '../decorator/permission.decorator';
import { Roles } from '../decorator/role.decorator';
import { Role } from '../enum/role.enum';
import { PermissionGuard } from '../guards/permission.guard';
import { RoleGuard } from '../guards/role.guard';
import { DeleteMessageDto } from '../dto/message/delete.dto';
import { BlockDto } from '../dto/block/block.dto';
import { BlockService } from '../block/block.service';

@Controller('messages')
export class MessageController {
  constructor(
    private messageService: MessageService,
    private usersService: UserService,
    private blockService: BlockService
  ) {}

  @UseGuards(AuthGuard, PermissionGuard, RoleGuard)
  @Permissions('send_message')
  @Roles(Role.Teacher, Role.SubTeacher, Role.Student)
  @Post('send/:id')
  async sendMessage(
    @Req() req, 
    @Param('id') id: number, 
    @Body('content') content: string) {
    const sender = await this.usersService.findOne(req.user.username);
    const receiver = await this.usersService.findOneById(id);

    if (sender.id === receiver.id) {
      throw new ForbiddenException('You cannot send a message to yourself');
    }

    return this.messageService.sendMessage(sender, receiver, content);
  }

  @UseGuards(AuthGuard, PermissionGuard, RoleGuard)
  @Permissions('delete_message')
  @Roles(Role.Teacher, Role.SubTeacher, Role.Student)
  @Delete('delete/:targetUserId')
  async deleteMessages(
    @Req() req,
    @Param('targetUserId') targetUserId: number,
    @Body() deleteData: DeleteMessageDto
  ) {
    const user = await this.usersService.findOne(req.user.username);
    await this.messageService.deleteMessagesBetweenUsers(user.id, targetUserId, deleteData);
  }


  @UseGuards(AuthGuard)
  @Permissions('block_user')
  @Roles(Role.Teacher, Role.SubTeacher, Role.Student)
  @Post('block')
  async blockUser(
    @Req() req,
    @Body() blockData: BlockDto
  ) {
    const user = await this.usersService.findOne(req.user.username);
    await this.blockService.blockUser(user, blockData);
  }

  @UseGuards(AuthGuard, PermissionGuard, RoleGuard)
  @Permissions('unblock_user')
  @Roles(Role.Teacher, Role.SubTeacher, Role.Student)
  @Post('unblock')
  async unblockUser(
    @Req() req,
    @Body() blockData: BlockDto
  ) {
    const user = await this.usersService.findOne(req.user.username);
    await this.blockService.unblockUser(user, blockData);
  }

}