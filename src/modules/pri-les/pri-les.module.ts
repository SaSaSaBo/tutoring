import { Module } from '@nestjs/common';
import { PriLesController } from './pri-les.controller';
import { PriLesService } from './pri-les.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PriLesEntity } from './pri-les.entity';
import { UsersEntity } from '../user/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([
    PriLesEntity,
    UsersEntity,
  ])],
  controllers: [PriLesController],
  providers: [PriLesService]
})
export class PriLesModule {}
