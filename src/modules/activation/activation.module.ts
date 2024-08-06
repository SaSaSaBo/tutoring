import { Module } from '@nestjs/common';
import { ActivationController } from './activation.controller';
import { ActivationService } from './activation.service';
import { ActivationEntity } from './activation.entity';
import { UsersEntity } from '../user/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailService } from '../service/email.service';
import { SmsService } from '../service/sms.service';
import { ProfileEntity } from '../profile/profile.entity';
import { TProfileEntity } from '../profile/tprofile.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ActivationEntity, 
      UsersEntity,
      ProfileEntity,
      TProfileEntity,
    ]),
  ],
  controllers: [ActivationController],
  providers: [
    ActivationService,
    EmailService,
    SmsService,
  ]
})
export class ActivationModule {}
