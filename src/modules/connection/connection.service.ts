import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConnectionEntity } from './connection.entity';
import { UsersEntity } from '../user/user.entity';

@Injectable()
export class ConnectionService {
  constructor(
    @InjectRepository(ConnectionEntity)
    private connectionRepository: Repository<ConnectionEntity>,
  ) {}

  async sendRequest(requester: UsersEntity, requestee: UsersEntity): Promise<ConnectionEntity> {
    const connection = this.connectionRepository.create({ requester, requestee });
    return this.connectionRepository.save(connection);
  }

  async acceptRequest(connectionId: number): Promise<ConnectionEntity> {
    const connection = await this.connectionRepository.findOne({
        where: { id: connectionId },
      });
    connection.accepted = true;
    return this.connectionRepository.save(connection);
  }

  async findAllConnections(userId: number): Promise<ConnectionEntity[]> {
    return this.connectionRepository.find({
      where: [{ requester: { id: userId } }, { requestee: { id: userId } }],
      relations: ['requester', 'requestee'],
    });
  }
}
