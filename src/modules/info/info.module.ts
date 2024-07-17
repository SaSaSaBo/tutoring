import { Module } from '@nestjs/common';
import { InfoController } from './info.controller';
import { InfoService } from './info.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InfoEntity } from './info.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([InfoEntity]),
  ],
  controllers: [InfoController],
  providers: [InfoService]
})
export class InfoModule {}
