import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InOutEntity } from './in-out.entity';
import { UsersEntity } from '../user/user.entity';

@Injectable()
export class InOutService {

  constructor(
    @InjectRepository(InOutEntity)
    private inOutRepository: Repository<InOutEntity>,
    @InjectRepository(UsersEntity)
    private userRepository: Repository<UsersEntity>,
  ) {}

  async logAction(userId: number, action: string, accessToken: string | null): Promise<void> {
    const user = await this.userRepository.findOneOrFail({ where: { id: userId } }); // userId yerine id kullanılıyor
    
    let existingLog: InOutEntity;

    if (action === 'login') {
      existingLog = await this.findLog(userId, 'logout');
    } else if (action === 'logout') {
      existingLog = await this.findLog(userId, 'login');
    }

    if (existingLog) {
      existingLog.inOut = action;
      existingLog.inOutDate = new Date();
      existingLog.accessToken = accessToken;
      await this.inOutRepository.save(existingLog);
    } else {
      const newLog = new InOutEntity();
      newLog.user = user;
      newLog.inOut = action;
      newLog.inOutDate = new Date();
      newLog.accessToken = accessToken;
      newLog.accessExpiredDate = new Date(new Date().getTime() + 120 * 60 * 1000);
      await this.inOutRepository.save(newLog);
    }
  }

  async findLog(userId: number, action: string): Promise<InOutEntity | undefined> {
    return this.inOutRepository.findOne({
      where: { user: { id: userId }, inOut: action },
      order: { inOutDate: 'DESC' }
    });
  }
}
