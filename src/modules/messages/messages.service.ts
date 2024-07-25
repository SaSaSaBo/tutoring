import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersEntity } from '../user/user.entity';
import { MessageEntity } from './messages.entity';
import { ConnectionEntity } from '../connection/connection.entity';
import { Role } from '../enum/role.enum';
import { DeleteMessageDto } from '../dto/message/delete.dto';
import { BlockEntity } from '../block/block.entity';

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(MessageEntity)
    private messageRepository: Repository<MessageEntity>,

    @InjectRepository(ConnectionEntity)
    private connectionRepository: Repository<ConnectionEntity>,

    @InjectRepository(BlockEntity)
    private blockRepository: Repository<BlockEntity>,
    
  ) {}
  async sendMessage(sender: UsersEntity, receiver: UsersEntity, content: string): Promise<MessageEntity> {
    // Aktif blok kayıtlarını kontrol et
    const activeBlocks = await this.blockRepository.find({
        where: [
            { blocker: { id: sender.id }, blocked: { id: receiver.id }, unblockedDate: null },
            { blocker: { id: receiver.id }, blocked: { id: sender.id }, unblockedDate: null }
        ],
    });

    console.log('activeBlocks: ', activeBlocks);
    
    if (!activeBlocks) {
        throw new ForbiddenException('You cannot send a message because one of the users is blocked.');
    }

    if(activeBlocks.length != null){
      throw new ForbiddenException('You cannot send a message because one of the users is blocked.');
    }

    const connection = await this.connectionRepository.findOne({
        where: [
            { requester: sender, requestee: receiver },
            { requester: receiver, requestee: sender },
        ],
    });

    if ((sender.roles === Role.Teacher) && !connection) {
        throw new ForbiddenException('Teacher or Sub-Teacher cannot initiate the first message.');
    }

    if (sender.roles === Role.Student && connection && !connection.accepted) {
        throw new BadRequestException('Connection not accepted.');
    }

    if (sender.roles === Role.Student && !connection) {
        throw new NotFoundException('Connection not found.');
    }

    const message = this.messageRepository.create({ sender, receiver, content });
    return this.messageRepository.save(message);
}




  async findMessages(userId: number): Promise<MessageEntity[]> {
    return this.messageRepository.find({
      where: [
        { sender: { id: userId } },
        { receiver: { id: userId } }
      ],
      relations: ['sender', 'receiver'],
      order: { timestamp: 'DESC' },
    });
  }

  async deleteMessagesBetweenUsers(userId: number, targetUserId: number, deleteData: DeleteMessageDto): Promise<void> {
    try {    
      const messages = await this.messageRepository.find({
          where: [
            { sender: { id: userId }, receiver: { id: targetUserId }, deletedAt: null },
            { sender: { id: targetUserId }, receiver: { id: userId }, deletedAt: null },
          ],
        });

        if (messages.length === 0) {
          throw new NotFoundException('No messages found between the users.');
        }
        
        if (deleteData.softDelete === true) {
          // Perform a soft delete
          for (const message of messages) {
            message.deletedAt = new Date();
          }
          await this.messageRepository.save(messages);
          // Return message or log if necessary, but not directly from this method
        } else {
          // Perform a hard delete
          await this.messageRepository.remove(messages);
          // Return message or log if necessary, but not directly from this method
        } 
      } catch (error) {
        if (error instanceof NotFoundException || error instanceof BadRequestException) {
          throw error;
        } else {
          throw new Error('An error occurred while deleting the messages!');
        }
      }

  }

}