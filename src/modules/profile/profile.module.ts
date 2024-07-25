import { Module } from '@nestjs/common';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersEntity } from '../user/user.entity';
import { InOutEntity } from '../in-out/in-out.entity';
import { ProfileEntity } from './profile.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProfileEntity,
      UsersEntity,
      InOutEntity,
    ])
  ],
  controllers: [ProfileController],
  providers: [ProfileService]
})
export class ProfileModule {}
