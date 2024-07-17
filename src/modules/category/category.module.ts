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
@Module({
  imports: [
    TypeOrmModule.forFeature([ 
      CategoryEntity,
      TransactionEntity,
      UsersEntity,
      InfoEntity,
      InOutEntity,
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
    AuthenticationService
  ]
})
export class CategoryModule {}
