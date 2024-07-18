import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CategoryModule } from './modules/category/category.module';
import { TransactionModule } from './modules/transaction/transaction.module';
import { typeOrmDatabase } from './core/database';
import { UserModule } from './modules/user/user.module';
import { InfoModule } from './modules/info/info.module';
import { InOutModule } from './modules/in-out/in-out.module';
import { IpLoggerMiddleware } from './common/middleware/ip-logger.middleware';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { AuthModule } from './modules/auth/auth.module';
import { AuthService } from './modules/auth/auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersEntity } from './modules/user/user.entity';
import { PasswordService } from './modules/service/password.service';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { InOutService } from './modules/in-out/in-out.service';
import { UserService } from './modules/user/user.service';
import { CategoryEntity } from './modules/category/category.entity';
import { InfoService } from './modules/info/info.service';
import { InfoEntity } from './modules/info/info.entity';
import { InOutEntity } from './modules/in-out/in-out.entity';
import { ClassroomModule } from './modules/classroom/classroom.module';
import { ClassroomService } from './modules/classroom/classroom.service';
import { ClassroomEntity } from './modules/classroom/classroom.entity';

@Module({
  imports: [
    ...typeOrmDatabase,
    JwtModule.register({
      secret: 'kitten', // Buraya gizli anahtarınızı ekleyin
      signOptions: { expiresIn: '1h' }, // Token geçerlilik süresi
    }),
    TypeOrmModule.forFeature([
      UsersEntity,
      InOutEntity,
      CategoryEntity,
      InfoEntity,
      ClassroomEntity,
    ]),
    CategoryModule, 
    TransactionModule, 
    UserModule, 
    InfoModule, 
    InOutModule, 
    AuthModule,
    ClassroomModule,
  ],
  controllers: [AppController],
  providers: [
    AppService, 
    AuthService,
    PasswordService,
    JwtService,
    InOutService,
    UserService,
    InfoService,
    ClassroomService,
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer){
    consumer
    .apply(LoggerMiddleware, IpLoggerMiddleware)
    .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
