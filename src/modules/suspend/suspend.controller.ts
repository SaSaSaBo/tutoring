import { Controller, Param, Post, UseGuards, Req } from '@nestjs/common';
import { SuspendService } from './suspend.service';
import { AuthGuard } from '../guards/auth.guard';
import { RoleGuard } from '../guards/role.guard';
import { PermissionGuard } from '../guards/permission.guard';
import { Roles } from '../decorator/role.decorator';
import { Permissions } from '../decorator/permission.decorator';
import { Role } from '../enum/role.enum';
import { Request } from 'express';

@Controller('suspend')
export class SuspendController {
  constructor(private readonly suspendService: SuspendService) {}

  @Post('suspend/:userId')
  @UseGuards(AuthGuard, RoleGuard, PermissionGuard)
  @Permissions('suspend_user')
  @Roles(Role.Manager)
  async suspend(@Param('userId') userId: number, @Req() req) {
    const currentUserRole = req.user.role; // Doğru rol bilgisi
    return this.suspendService.suspend(userId, currentUserRole);
  }

  @Post('unsuspend/:userId')
  @UseGuards(AuthGuard, RoleGuard, PermissionGuard)
  @Permissions('unsuspend_user')
  @Roles(Role.Manager)
  async unSuspend(@Param('userId') userId: number, @Req() req) {
    const currentUserRole = req.user.role; // Doğru rol bilgisi
    return this.suspendService.unSuspend(userId, currentUserRole);
  }
}
