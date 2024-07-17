import { Injectable } from '@nestjs/common';
import { TransactionEntity } from '../transaction/transaction.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class TransactionService {

    constructor(
        @InjectRepository(TransactionEntity) 
        // eslint-disable-next-line no-unused-vars
        private readonly trnRepository: Repository<TransactionEntity>,
    ) {}
    
  async addLog(data: TransactionEntity): Promise<TransactionEntity> {
    try {
      return this.trnRepository.save(data);
    } catch (error) {
      console.error(error);
      throw new Error(error.message);
    }
  }

}
