import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersEntity } from './user.entity';
import { CategoryEntity } from '../category/category.entity';
import { InfoEntity } from '../info/info.entity';
import { CategoryService } from '../category/category.service';
import { InfoService } from '../info/info.service';
import { InOutService } from '../in-out/in-out.service';
import { PasswordService } from '../service/password.service';
import { JwtService } from '@nestjs/jwt';
import { TransactionEntity } from '../transaction/transaction.entity';
import { TransactionService } from '../transaction/transaction.service';
import { AuthenticationService } from '../in-out/auth/authentication.service';
import { AuthService } from '../auth/auth.service';
import { InOutEntity } from '../in-out/in-out.entity';
import { UserCrEntity } from '../entity/user.cr.entity';
import { ClassroomEntity } from '../classroom/classroom.entity';
import { MessageEntity } from '../messages/messages.entity';
import { ConnectionEntity } from '../connection/connection.entity';
import { MessageService } from '../messages/messages.service';
import { ConnectionService } from '../connection/connection.service';
import { RequestEntity } from '../request/request.entity';
import { BlockEntity } from '../block/block.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ 
      UsersEntity,
      CategoryEntity,
      TransactionEntity,
      InfoEntity,
      InOutEntity,
      UserCrEntity,
      ClassroomEntity,
      MessageEntity,
      ConnectionEntity,
      RequestEntity,
      BlockEntity,
    ])
  ],
  controllers: [UserController],
  providers: [
    UserService,
    CategoryService,
    TransactionService,
    InfoService,
    InOutService,
    PasswordService,
    JwtService,
    AuthenticationService,
    AuthService,
    MessageService,
    ConnectionService,
  ],
})
export class UserModule {}
