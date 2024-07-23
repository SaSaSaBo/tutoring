import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConnectionEntity } from './connection.entity';
import { UsersEntity } from '../user/user.entity';
import { SendConnectionDto } from '../dto/connection/send.dto';
import { AcceptConnectionDto } from '../dto/connection/accept.dto';
import { DeleteConnectionDto } from '../dto/connection/delete.dto';

@Injectable()
export class ConnectionService {
  constructor(
    @InjectRepository(ConnectionEntity)
    private connectionRepository: Repository<ConnectionEntity>,
  ) {}

  async sendRequest(requester: UsersEntity, requestee: UsersEntity, sendData: SendConnectionDto): Promise<ConnectionEntity> {
    // Check if an existing connection request exists between requester and requestee
    const existingConnection = await this.connectionRepository.findOne({
      where: [
        { requester: { id: requester.id }, requestee: { id: requestee.id }, deletedAt: null },
        { requester: { id: requestee.id }, requestee: { id: requester.id }, deletedAt: null }
      ],
      relations: ['requester', 'requestee'] // Ensure relations are loaded if needed
    });
  
    if (existingConnection) {
      throw new ConflictException('A connection request already exists between these users.');
    }
  
    // Create a new connection request
    const connection = this.connectionRepository.create({ requester, requestee });
  
    const { pre_message } = sendData;
  
    console.log('Connection: ', connection);
    console.log('PreMessage: ', pre_message);
  
    if (pre_message) {
      connection.pre_message = pre_message;
    }
    
    return this.connectionRepository.save(connection);
  }
  

  async acceptRequest(requesteeId: UsersEntity, requesterId: UsersEntity, acceptData: AcceptConnectionDto): Promise<ConnectionEntity> {        
    const connection = await this.connectionRepository.findOne({
      where: {
        requester: { id: requesterId.id },
        requestee: { id: requesteeId.id },
      }
    });
  
    if (!connection) {
      throw new NotFoundException('Connection not found');
    }

    console.log('Connection: ', connection);
  
    connection.accepted = acceptData.accepted;
    await this.connectionRepository.save(connection);
  
    return connection;
  }

  async deleteRequest(requestee: UsersEntity, requester: UsersEntity, deleteData: DeleteConnectionDto): Promise<ConnectionEntity> {
    console.log(`Requester ID: ${requester.id}, Requestee ID: ${requestee.id}`);
    
    const connection = await this.connectionRepository.findOne({
      where: [
        { requester: { id: requester.id }, requestee: { id: requestee.id }, deletedAt: null },
        { requester: { id: requestee.id }, requestee: { id: requester.id }, deletedAt: null }
      ]
    });
  
    if (!connection) {
      throw new NotFoundException('Connection not found');
    }
  
    console.log('Connection: ', connection);
    if (deleteData.softDelete) {
      connection.deletedAt = new Date();
      await this.connectionRepository.save(connection);
    } else {
      await this.connectionRepository.remove(connection);
    }
  
    return connection;
  }
  
  
}
