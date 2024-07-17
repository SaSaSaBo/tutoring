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

@Module({
  imports: [
    TypeOrmModule.forFeature([ 
      UsersEntity,
      CategoryEntity,
      TransactionEntity,
      InfoEntity,
      InOutEntity,
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
    AuthService
  ],
})
export class UserModule {}
