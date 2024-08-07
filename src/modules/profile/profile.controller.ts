import { Body, Controller, Param, Post, Req } from '@nestjs/common';
import { LogService } from '../service/log.service';
import { ProfileService } from './profile.service';

@Controller('profile')
export class ProfileController {

    constructor(
        private profileService: ProfileService,
        private logService: LogService
    ) {}

    @Post(':profileId/share')
    async sharePhone(
        @Param('profileId') profileId: number, 
        @Body('userId') userId: number, 
        @Req() req): Promise<void> {
            await this.profileService.sharePhone(profileId, userId);
            await this.logService.logShareAction(profileId, userId, true);
        }

    @Post(':profileId/unshare')
    async unsharePhone(
        @Param('profileId') profileId: number, 
        @Body('userId') userId: number, 
        @Req() req): Promise<void> {
            await this.profileService.unsharePhone(profileId, userId);
            await this.logService.logShareAction(profileId, userId, false);
        }
}
