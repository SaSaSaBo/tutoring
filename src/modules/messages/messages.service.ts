import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersEntity } from '../user/user.entity';
import { MessageEntity } from './messages.entity';
import { ConnectionEntity } from '../connection/connection.entity';
import { Role } from '../enum/role.enum';
import { DeleteMessageDto } from '../dto/message/delete.dto';

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(MessageEntity)
    private messageRepository: Repository<MessageEntity>,

    @InjectRepository(ConnectionEntity)
    private connectionRepository: Repository<ConnectionEntity>,
  ) {}

  async sendMessage(sender: UsersEntity, receiver: UsersEntity, content: string): Promise<MessageEntity> {
    const connection = await this.connectionRepository.findOne({
      where: [
        { requester: sender, requestee: receiver },
        { requester: receiver, requestee: sender },
      ],
    });

    // Mesaj atan kişinin rolü 'teacher' veya 'sub_teacher' ise ve ilk mesaj atma girişimindeyse
    if ((sender.roles === Role.Teacher || sender.roles === Role.SubTeacher) && !connection) {
      throw new ForbiddenException('Teacher or Sub-Teacher cannot initiate the first message.');
    }

    // Mesaj atan kişinin rolü 'student' ise ve bağlantı kabul edilmemişse
    if (sender.roles === Role.Student && connection && !connection.accepted) {
      throw new BadRequestException('Connection not accepted.');
    }

    // Mesaj atan kişi rolü 'student' ise ve bağlantı yoksa
    if (sender.roles === Role.Student && !connection) {
      throw new NotFoundException('Connection not found.');
    }

    // Mesaj oluştur ve kaydet
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