import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BlockEntity } from './block.entity';
import { UsersEntity } from '../user/user.entity';
import { MessageEntity } from '../messages/messages.entity';
import { BlockDto } from '../dto/block/block.dto';

@Injectable()
export class BlockService {
  constructor(
    @InjectRepository(BlockEntity)
    private blockRepository: Repository<BlockEntity>,

    @InjectRepository(MessageEntity)
    private messageRepository: Repository<MessageEntity>,

  ) {}

  async blockUser(blocker: UsersEntity, blockData: BlockDto): Promise<BlockEntity> {
    const { blockedUserId } = blockData;

    console.log('blockData: ', blockData);
    console.log('blockedUserId: ', blockedUserId);
    
    
    // Kullanıcının daha önce bloklanıp bloklanmadığını kontrol et
    const existingBlock = await this.blockRepository.findOne({
      where: {
        blocker: { id: blocker.id },
        blocked: { id: blockedUserId },
      },
    });

    if (existingBlock) {
      throw new ForbiddenException('You have already blocked this user.');
    }

    console.log('existingBlock: ', existingBlock);    

    // Mesajlaşma kontrolü
    const messages = await this.messageRepository.find({
      where: [
        { sender: { id: blocker.id }, receiver: { id: blockedUserId } },
        { sender: { id: blockedUserId }, receiver: { id: blocker.id } },
      ],
    });

    // Eğer mesajlaşma yoksa hata fırlat
    if (messages.length === 0) {
      throw new ForbiddenException('You cannot block this user as there are no messages exchanged.');
    }
    
    console.log('messages: ', messages);
    

    const blockEntity = new BlockEntity();
    blockEntity.blocked = new UsersEntity();
    blockEntity.blocked.id = blockedUserId
    blockEntity.blocker = blocker

    return this.blockRepository.save(blockEntity);
  }

  async unblockUser(blocker: UsersEntity, blockData: BlockDto): Promise<void> {
    const { blockedUserId } = blockData;
    const block = await this.blockRepository.findOne({
      where: {
        blocker: { id: blocker.id },
        blocked: { id: blockedUserId },
      },
    });

    if (!block) {
      throw new ForbiddenException('No block record found.');
    }

    block.unblockedDate = new Date();
    await this.blockRepository.save(block);
  }

  async isBlocked(blockerId: number, blockedUserId: number): Promise<boolean> {
    const block = await this.blockRepository.findOne({
      where: {
        blocker: { id: blockerId },
        blocked: { id: blockedUserId },
      },
    });
    return !!block;
  }

}