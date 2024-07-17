import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './modules/user/user.module';
import { InfoModule } from './modules/info/info.module';
import { InOutModule } from './modules/in-out/in-out.module';
import { AuthModule } from './modules/auth/auth.module';
import { CategoryModule } from './modules/category/category.module';
import { TransactionModule } from './modules/transaction/transaction.module';
import { ClassroomModule } from './modules/classroom/classroom.module';

@Module({
  imports: [
    UserModule, 
    InfoModule, 
    InOutModule, 
    AuthModule, 
    CategoryModule, 
    TransactionModule, 
    ClassroomModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
