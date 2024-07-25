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
import { CategoryService } from '../category/category.service';
import { TransactionService } from '../transaction/transaction.service';
import { TransactionEntity } from '../transaction/transaction.entity';
import { AuthService } from '../auth/auth.service';
import { InOutService } from '../in-out/in-out.service';
import { ConnectionEntity } from '../connection/connection.entity';
import { ConnectionService } from '../connection/connection.service';
import { RequestEntity } from '../request/request.entity';
import { BlockService } from '../block/block.service';
import { BlockEntity } from '../block/block.entity';
import { ProfileEntity } from '../profile/profile.entity';

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
      TransactionEntity,
      ConnectionEntity,
      RequestEntity,
      BlockEntity,
      ProfileEntity,
    ])
  ],
  controllers: [MessageController],
  providers: [
    MessageService,
    UserService,
    InfoService,
    PasswordService,
    CategoryService,
    TransactionService,
    AuthService,
    InOutService,
    ConnectionService,
    BlockService,
  ]
})
export class MessagesModule {}
