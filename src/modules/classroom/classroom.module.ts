import { Module } from '@nestjs/common';
import { ClassroomService } from './classroom.service';
import { ClassroomController } from './classroom.controller';

@Module({
  providers: [ClassroomService],
  controllers: [ClassroomController]
})
export class ClassroomModule {}
