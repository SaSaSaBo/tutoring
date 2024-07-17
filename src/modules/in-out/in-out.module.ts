import { Module } from '@nestjs/common';
import { InOutController } from './in-out.controller';
import { InOutService } from './in-out.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersEntity } from '../user/user.entity';
import { UserModule } from '../user/user.module';
import { InOutEntity } from './in-out.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      InOutEntity,
      UsersEntity
    ]),
    UserModule
  ],
  controllers: [InOutController],
  providers: [InOutService],
  exports:[InOutService]
})
export class InOutModule {}
