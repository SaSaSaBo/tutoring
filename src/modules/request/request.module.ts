import { Module } from '@nestjs/common';
import { RequestController } from './request.controller';
import { RequestService } from './request.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RequestEntity } from './request.entity';
import { AuthService } from '../auth/auth.service';
import { UsersEntity } from '../user/user.entity';
import { UserService } from '../user/user.service';
import { InOutService } from '../in-out/in-out.service';
import { PasswordService } from '../service/password.service';
import { CategoryEntity } from '../category/category.entity';
import { InOutEntity } from '../in-out/in-out.entity';
import { UserCrEntity } from '../entity/user.cr.entity';
import { ClassroomEntity } from '../classroom/classroom.entity';
import { InfoService } from '../info/info.service';
import { InfoEntity } from '../info/info.entity';
import { CategoryService } from '../category/category.service';
import { TransactionService } from '../transaction/transaction.service';
import { TransactionEntity } from '../transaction/transaction.entity';
import { ProfileEntity } from '../profile/profile.entity';
import { ConnectionEntity } from '../connection/connection.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      RequestEntity,
      UsersEntity,
      CategoryEntity,
      InOutEntity,
      UserCrEntity,
      ClassroomEntity,
      InfoEntity,
      TransactionEntity,
      ProfileEntity,
      ConnectionEntity,
    ])
  ],
  controllers: [RequestController],
  providers: [
    RequestService,
    AuthService,
    UserService,
    InOutService,
    PasswordService,
    InfoService,
    CategoryService,
    TransactionService,
  ]
})
export class RequestModule {}
