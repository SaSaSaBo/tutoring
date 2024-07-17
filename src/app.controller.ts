import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { UserLoginDto } from './modules/dto/user/login.dto';

@Controller()
export class AppController {

  // constructor(private readonly appService: AppService) {}

  @Post()
  async test(@Body() data: UserLoginDto) {
    console.log(data);
  }

  @Get()
  someProtectedRoute(@Req() req) {
    console.log(req.userId);
    
    return {
      message: 'some protected route',
      userId: req.userId,
    };
  }

}