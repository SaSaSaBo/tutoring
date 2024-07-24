import { Controller, Post, Param, UseGuards, Req, Body, NotFoundException, Delete } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { AuthGuard } from '../guards/auth.guard';
import { PermissionGuard } from '../guards/permission.guard';
import { RoleGuard } from '../guards/role.guard';
import { Roles } from '../decorator/role.decorator';
import { Role } from '../enum/role.enum';
import { Permissions } from '../decorator/permission.decorator';
import { AcceptConnectionDto } from '../dto/connection/accept.dto';
import { DeleteConnectionDto } from '../dto/connection/delete.dto';
import { RequestService } from './request.service';

@Controller('requests')
export class RequestController {
  constructor(
    private requestService: RequestService,
    private usersService: UserService,
  ) {}

  @UseGuards(AuthGuard, RoleGuard, PermissionGuard)
  @Permissions('send_request')
  @Roles(Role.Teacher, Role.SubTeacher)
  @Post('request/:id')
  async sendRequest(
    @Req() req, 
    @Param('id') id: number,
  ) {
    const requester = await this.usersService.findOne(req.user.username);
    const requestee = await this.usersService.findOneById(id);
    return this.requestService.sendRequest(requester, requestee);
  }

  @UseGuards(AuthGuard, RoleGuard, PermissionGuard)
  @Permissions('accept_request')
  @Roles(Role.Student)
  @Post('accept/:id')
  async acceptRequest(
    @Req() req,
    @Param('id') id: number, 
    @Body() acceptData: AcceptConnectionDto 
  ) {
    const requestee = await this.usersService.findOneById(req.user.sub); 
    const requester = await this.usersService.findOneById(id); 

    if (!requestee) {
      throw new NotFoundException('Requestee not found');
    }
  
    if (!requester) {
      throw new NotFoundException('Requester not found');
    }
  
    return this.requestService.acceptRequest(requestee, requester, acceptData); 
  }

  @UseGuards(AuthGuard, RoleGuard, PermissionGuard)
  @Permissions('cancel_request')
  @Roles(Role.Teacher, Role.SubTeacher)
  @Delete('delete/:id') 
  async deleteRequest(
    @Req() req,
    @Param('id') id: number,
    @Body() deleteData: DeleteConnectionDto
  ) {
    const requester = await this.usersService.findOne(req.user.username);
    const requestee = await this.usersService.findOneById(id);
    return this.requestService.deleteRequest(requester, requestee, deleteData);
  }

}
