import { Module } from '@nestjs/common';
import { BlockService } from './block.service';
import { BlockController } from './block.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersEntity } from '../user/user.entity';
import { BlockEntity } from './block.entity';
import { MessageEntity } from '../messages/messages.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      BlockEntity, 
      UsersEntity,
      MessageEntity,
    ]),
  ],
  controllers: [BlockController],
  providers: [
    BlockService,
  ]
})
export class BlockModule {}
