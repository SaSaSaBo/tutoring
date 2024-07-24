import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersEntity } from '../user/user.entity';
import { SendConnectionDto } from '../dto/connection/send.dto';
import { AcceptConnectionDto } from '../dto/connection/accept.dto';
import { DeleteConnectionDto } from '../dto/connection/delete.dto';
import { RequestEntity } from './request.entity';

@Injectable()
export class RequestService {
  constructor(
    @InjectRepository(RequestEntity)
    private reqRepository: Repository<RequestEntity>,
  ) {}

  async sendRequest(requester: UsersEntity, requestee: UsersEntity): Promise<RequestEntity> {
    // Check if an existing connection request exists between requester and requestee
    const existingConnection = await this.reqRepository.findOne({
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
    const connection = this.reqRepository.create({ requester, requestee });
  
    console.log('Connection: ', connection);
    
    return this.reqRepository.save(connection);
  }
  

  async acceptRequest(requesteeId: UsersEntity, requesterId: UsersEntity, acceptData: AcceptConnectionDto): Promise<RequestEntity> {        
    const connection = await this.reqRepository.findOne({
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
    await this.reqRepository.save(connection);
  
    return connection;
  }

  async deleteRequest(requestee: UsersEntity, requester: UsersEntity, deleteData: DeleteConnectionDto): Promise<RequestEntity> {
    console.log(`Requester ID: ${requester.id}, Requestee ID: ${requestee.id}`);
    
    const connection = await this.reqRepository.findOne({
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
      await this.reqRepository.save(connection);
    } else {
      await this.reqRepository.remove(connection);
    }
  
    return connection;
  }
  
  
}
