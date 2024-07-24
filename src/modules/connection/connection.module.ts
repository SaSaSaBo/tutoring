import { Module } from '@nestjs/common';
import { ConnectionController } from './connection.controller';
import { ConnectionService } from './connection.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConnectionEntity } from './connection.entity';
import { UserService } from '../user/user.service';
import { UsersEntity } from '../user/user.entity';
import { CategoryEntity } from '../category/category.entity';
import { InOutEntity } from '../in-out/in-out.entity';
import { UserCrEntity } from '../entity/user.cr.entity';
import { ClassroomEntity } from '../classroom/classroom.entity';
import { InfoService } from '../info/info.service';
import { PasswordService } from '../service/password.service';
import { InfoEntity } from '../info/info.entity';
import { AuthService } from '../auth/auth.service';
import { InOutService } from '../in-out/in-out.service';
import { CategoryService } from '../category/category.service';
import { TransactionService } from '../transaction/transaction.service';
import { TransactionEntity } from '../transaction/transaction.entity';
import { RequestEntity } from '../request/request.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ConnectionEntity,
      UsersEntity,
      CategoryEntity,
      InOutEntity,
      UserCrEntity,
      ClassroomEntity,
      InfoEntity,
      TransactionEntity,
      RequestEntity,
    ])
  ],
  controllers: [ConnectionController],
  providers: [
    ConnectionService,
    UserService,
    InfoService,
    PasswordService,
    UserService,
    AuthService,
    InOutService,
    CategoryService,
    TransactionService,
  ]
})
export class ConnectionModule {}
