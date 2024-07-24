import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConnectionEntity } from './connection.entity';
import { UsersEntity } from '../user/user.entity';
import { SendConnectionDto } from '../dto/connection/send.dto';
import { AcceptConnectionDto } from '../dto/connection/accept.dto';
import { DeleteConnectionDto } from '../dto/connection/delete.dto';
import { BlockEntity } from '../block/block.entity';

@Injectable()
export class ConnectionService {
  constructor(
    @InjectRepository(ConnectionEntity)
    private connectionRepository: Repository<ConnectionEntity>,

    @InjectRepository(BlockEntity)
    private blockRepository: Repository<BlockEntity>,

  ) {}

  async sendConnection(requester: UsersEntity, requestee: UsersEntity, sendData: SendConnectionDto): Promise<ConnectionEntity> {
    // Aktif blok kayıtlarını kontrol et
    const activeBlocks = await this.blockRepository.find({
        where: [
            { blocker: { id: requester.id }, blocked: { id: requestee.id }, unblockedDate: null },
            { blocker: { id: requestee.id }, blocked: { id: requester.id }, unblockedDate: null }
        ],
    });

    console.log('activeBlocks: ', activeBlocks);
    
    if (!activeBlocks) {
        throw new ForbiddenException('You cannot send a connection request because one of the users is blocked.');
    }    

    if(activeBlocks.length != null){
      throw new ForbiddenException('You cannot send a connection request because one of the users is blocked.');
    }

    const existingConnection = await this.connectionRepository.findOne({
        where: [
            { requester: { id: requester.id }, requestee: { id: requestee.id }, deletedAt: null },
            { requester: { id: requestee.id }, requestee: { id: requester.id }, deletedAt: null }
        ],
        relations: ['requester', 'requestee']
    });

    if (existingConnection) {
        throw new ConflictException('A connection request already exists between these users.');
    }

    const connection = this.connectionRepository.create({ requester, requestee });

    const { pre_message } = sendData;

    if (pre_message) {
        connection.pre_message = pre_message;
    }

    return this.connectionRepository.save(connection);
}



  

  async acceptConnection(requesteeId: UsersEntity, requesterId: UsersEntity, acceptData: AcceptConnectionDto): Promise<ConnectionEntity> {        
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

  async deleteConnection(requestee: UsersEntity, requester: UsersEntity, deleteData: DeleteConnectionDto): Promise<ConnectionEntity> {
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
