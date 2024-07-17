import { Module } from '@nestjs/common';
import { TransactionController } from './transaction.controller';
import { TransactionService } from './transaction.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionEntity } from '../transaction/transaction.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([TransactionEntity])
  ],
  controllers: [TransactionController],
  providers: [TransactionService]
})
export class TransactionModule {}
