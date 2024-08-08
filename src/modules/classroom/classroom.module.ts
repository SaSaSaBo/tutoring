import { Module } from '@nestjs/common';
import { ClassroomService } from './classroom.service';
import { ClassroomController } from './classroom.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClassroomEntity } from './classroom.entity';
import { InfoService } from '../info/info.service';
import { InfoEntity } from '../info/info.entity';
import { AuthService } from '../auth/auth.service';
import { UsersEntity } from '../user/user.entity';
import { CategoryEntity } from '../category/category.entity';
import { TransactionEntity } from '../transaction/transaction.entity';
import { InOutEntity } from '../in-out/in-out.entity';
import { CategoryService } from '../category/category.service';
import { TransactionService } from '../transaction/transaction.service';
import { InOutService } from '../in-out/in-out.service';
import { UserService } from '../user/user.service';
import { PasswordService } from '../service/password.service';
import { UserCrEntity } from '../entity/user.cr.entity';
import { ConnectionEntity } from '../connection/connection.entity';
import { MessageEntity } from '../messages/messages.entity';
import { MessageService } from '../messages/messages.service';
import { ConnectionService } from '../connection/connection.service';
import { RequestEntity } from '../request/request.entity';
import { BlockEntity } from '../block/block.entity';
import { ProfileEntity } from '../profile/profile.entity';
import { PriLesEntity } from '../pri-les/pri-les.entity';
import { NotificationService } from '../service/notification.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ClassroomEntity,
      InfoEntity,
      UsersEntity,
      CategoryEntity,
      TransactionEntity,
      InOutEntity,
      UserCrEntity,
      ConnectionEntity,
      MessageEntity,
      RequestEntity,
      BlockEntity,
      ProfileEntity,
      PriLesEntity,
    ])
  ],
  providers: [
    ClassroomService,
    InfoService,
    AuthService,
    CategoryService,
    TransactionService,
    InOutService,
    UserService,
    PasswordService,
    MessageService,
    ConnectionService,
    NotificationService,
  ],
  controllers: [ClassroomController]
})
export class ClassroomModule {}
