import { Module } from '@nestjs/common';
import { MessageService } from './messages.service';
import { MessageController } from './messages.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessageEntity } from './messages.entity';
import { UserService } from '../user/user.service';
import { UsersEntity } from '../user/user.entity';
import { CategoryEntity } from '../category/category.entity';
import { InOutEntity } from '../in-out/in-out.entity';
import { UserCrEntity } from '../entity/user.cr.entity';
import { ClassroomEntity } from '../classroom/classroom.entity';
import { InfoService } from '../info/info.service';
import { PasswordService } from '../service/password.service';
import { InfoEntity } from '../info/info.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MessageEntity,
      UsersEntity,
      CategoryEntity,
      InOutEntity,
      UserCrEntity,
      ClassroomEntity,
      InfoEntity,
    ])
  ],
  controllers: [MessageController],
  providers: [
    MessageService,
    UserService,
    InfoService,
    PasswordService,
  ]
})
export class MessagesModule {}
