import { BadRequestException, Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { SendPriLesDto } from '../dto/pri-les/send.dto';
import { PriLesService } from './pri-les.service';
import { AcceptPriLesDto } from '../dto/pri-les/accept.dto';

@Controller('pri-les')
export class PriLesController {

    constructor(
        private priLesService: PriLesService,
    ) { }

    @Post('send')
    async sendPriLes(@Body() data: SendPriLesDto, @Req() req): Promise<{ message: string }> {
        // @Req() üzerinden accessToken alalım
        const accessToken = req.headers.authorization?.split(' ')[1]; // Bearer token'dan token'ı ayıklama
        
        if (!accessToken) {
            throw new Error('Access token is missing');
        }

        // PriLesService'i kullanarak pri-les isteğini gönder
        return this.priLesService.sendPriLes(data, accessToken);
    }

    @Post('accept')
    async acceptPriLes(@Body() data: AcceptPriLesDto, @Req() req): Promise<{ message: string }> {
        const accessToken = req.headers.authorization?.split(' ')[1]; // Token'ı alın (örneğin: "Bearer <token>")
        if (!accessToken) {
            throw new BadRequestException('Access token is required');
        }
        return this.priLesService.acceptPriLes(data, accessToken);
    }

    @Post('decline')
    async declinePriLes(@Body() data: AcceptPriLesDto, @Req() req): Promise<{ message: string }> {
        const accessToken = req.headers.authorization?.split(' ')[1]; // Token'ı alın (örneğin: "Bearer <token>")
        if (!accessToken) {
            throw new BadRequestException('Access token is required');
        }
        return this.priLesService.declinePriLes(data, accessToken);
    }

}
