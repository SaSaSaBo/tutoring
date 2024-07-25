import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from '../auth/auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersEntity } from '../user/user.entity';
import { PasswordService } from '../service/password.service';
import { InOutService } from '../in-out/in-out.service';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { CategoryEntity } from '../category/category.entity';
import { InfoService } from '../info/info.service';
import { InfoEntity } from '../info/info.entity';
import * as config from 'config';
import { InOutEntity } from '../in-out/in-out.entity';
import { CategoryService } from '../category/category.service';
import { TransactionService } from '../transaction/transaction.service';
import { TransactionEntity } from '../transaction/transaction.entity';
import { UserCrEntity } from '../entity/user.cr.entity';
import { ClassroomEntity } from '../classroom/classroom.entity';
import { RequestEntity } from '../request/request.entity';
import { ProfileService } from '../profile/profile.service';
import { ProfileEntity } from '../profile/profile.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UsersEntity,
      InOutEntity,
      CategoryEntity,
      InfoEntity,
      CategoryEntity,
      TransactionEntity,
      UserCrEntity,
      ClassroomEntity,
      RequestEntity,
      ProfileEntity,
    ]),
    JwtModule.register({
      global: true,
      secret: config.jwt.secret,
      signOptions: { expiresIn: '60s' },
    }),
    
  ],
  controllers: [AuthController],
  providers: [
    AuthService, 
    PasswordService,
    InOutService,
    JwtService,
    UserService,
    InfoService,
    CategoryService,
    TransactionService,
    ProfileService,
  ],
})
export class AuthModule {}
