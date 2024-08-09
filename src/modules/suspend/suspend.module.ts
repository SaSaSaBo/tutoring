import { Module } from '@nestjs/common';
import { SuspendController } from './suspend.controller';
import { SuspendService } from './suspend.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SuspendEntity } from './suspend.entity';
import { UsersEntity } from '../user/user.entity';
import { AuthService } from '../auth/auth.service';
import { ProfileEntity } from '../profile/profile.entity';
import { UserService } from '../user/user.service';
import { InOutService } from '../in-out/in-out.service';
import { PasswordService } from '../service/password.service';
import { CategoryEntity } from '../category/category.entity';
import { InOutEntity } from '../in-out/in-out.entity';
import { UserCrEntity } from '../entity/user.cr.entity';
import { ClassroomEntity } from '../classroom/classroom.entity';
import { RequestEntity } from '../request/request.entity';
import { InfoService } from '../info/info.service';
import { InfoEntity } from '../info/info.entity';
import { CategoryService } from '../category/category.service';
import { TransactionService } from '../transaction/transaction.service';
import { TransactionEntity } from '../transaction/transaction.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SuspendEntity,
      UsersEntity,
      ProfileEntity,
      CategoryEntity,
      InOutEntity,
      UserCrEntity,
      ClassroomEntity,
      RequestEntity,
      InfoEntity,
      TransactionEntity,
    ]),
  ],
  controllers: [SuspendController],
  providers: [
    SuspendService,
    AuthService,
    UserService,
    InOutService,
    PasswordService,
    InfoService,
    CategoryService,
    TransactionService,
  ]
})
export class SuspendModule {}
