import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InfoEntity } from './info.entity';

@Injectable()
export class InfoService {

  constructor(
    @InjectRepository(InfoEntity)
    private infoRepository: Repository<InfoEntity>,
  ) {}

  async addLog(infoData: InfoEntity): Promise<InfoEntity> {
    try {
      return this.infoRepository.save(infoData);
    } catch (error) {
      console.error(error);
      throw new Error(error.message);
    }
  }

  async getLogs(userId: number): Promise<InfoEntity[]> {
    try {
      return await this.infoRepository.find({ where: { user: { id: userId } } });
    } catch (error) {
      throw new Error(error.message);
    }
  }

}