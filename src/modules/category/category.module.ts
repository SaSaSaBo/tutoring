import { Module } from '@nestjs/common';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryEntity } from './category.entity';
import { TransactionEntity } from '../transaction/transaction.entity';
import { TransactionService } from '../transaction/transaction.service';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { UsersEntity } from '../user/user.entity';
import { InfoService } from '../info/info.service';
import { InOutService } from '../in-out/in-out.service';
import { PasswordService } from '../service/password.service';
import { InfoEntity } from '../info/info.entity';
import { AuthenticationService } from '../in-out/auth/authentication.service';
import { AuthService } from '../auth/auth.service';
import { InOutEntity } from '../in-out/in-out.entity';
import { UserCrEntity } from '../entity/user.cr.entity';
import { ClassroomEntity } from '../classroom/classroom.entity';
import { ConnectionEntity } from '../connection/connection.entity';
import { MessageEntity } from '../messages/messages.entity';
import { MessageService } from '../messages/messages.service';
import { ConnectionService } from '../connection/connection.service';
@Module({
  imports: [
    TypeOrmModule.forFeature([ 
      CategoryEntity,
      TransactionEntity,
      UsersEntity,
      InfoEntity,
      InOutEntity,
      UserCrEntity,
      ClassroomEntity,
      MessageEntity,
      ConnectionEntity,
    ]),
  ],
  controllers: [CategoryController],
  providers: [
    CategoryService,
    TransactionService,
    JwtService,
    UserService,
    InfoService,
    InOutService,
    PasswordService,
    AuthService,
    AuthenticationService,
    MessageService,
    ConnectionService,
  ]
})
export class CategoryModule {}
