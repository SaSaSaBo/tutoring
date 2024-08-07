import { Module } from '@nestjs/common';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersEntity } from '../user/user.entity';
import { InOutEntity } from '../in-out/in-out.entity';
import { ProfileEntity } from './profile.entity';
import { ClassroomEntity } from '../classroom/classroom.entity';
import { UserCrEntity } from '../entity/user.cr.entity';
import { InfoEntity } from '../info/info.entity';
import { InfoService } from '../info/info.service';
import { PasswordService } from '../service/password.service';
import { TProfileEntity } from './tprofile.entity';
import { LogService } from '../service/log.service';
import { ConnectionEntity } from '../connection/connection.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProfileEntity,
      UsersEntity,
      InOutEntity,
      ClassroomEntity,
      UserCrEntity,
      InfoEntity,
      TProfileEntity,
      ConnectionEntity,
    ])
  ],
  controllers: [ProfileController],
  providers: [
    ProfileService,
    InfoService,
    PasswordService, 
    LogService,
  ]
})
export class ProfileModule {}
