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

    // Mevcut aktif blokları kontrol et
    const activeBlocks = await this.blockRepository.find({
      where: {
        blocker: { id: blocker.id },
        blocked: { id: blockedUserId },
        unblockedDate: null, // Sadece aktif blokları kontrol et
      },
    });

    // Kullanıcı daha önce 2 defa blockladıysa, yeni blocklama yapamaz
    if (activeBlocks.length >= 2) {
      throw new ForbiddenException('You cannot block this user again.');
    }

    // Mevcut blok kaydını bul ve unblock tarihi varsa, yeni bir blok kaydı oluştur
    const existingBlock = activeBlocks[0]; // İlk aktif kaydı al (varsa)

    if (existingBlock) {
      if (existingBlock.unblockedDate) {
        // Eski blok kaydını 'archived' olarak işaretleyin
        existingBlock.unblockedDate = new Date(); // 'deletedAt' gibi bir alan kullanabilirsiniz
        await this.blockRepository.save(existingBlock);

        // Yeni bir blok kaydı oluştur
        const newBlockEntity = new BlockEntity();
        newBlockEntity.blocked = new UsersEntity();
        newBlockEntity.blocked.id = blockedUserId;
        newBlockEntity.blocker = blocker;

        return this.blockRepository.save(newBlockEntity);
      } else {
        throw new ForbiddenException('You have already blocked this user.');
      }
    }

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
    blockEntity.blocked.id = blockedUserId;
    blockEntity.blocker = blocker;

    return this.blockRepository.save(blockEntity);
  }

  async unblockUser(blocker: UsersEntity, blockData: BlockDto): Promise<void> {
    const { blockedUserId } = blockData;

        // Mevcut aktif blokları kontrol et
        const activeBlocks = await this.blockRepository.find({
          where: {
            blocker: { id: blocker.id },
            blocked: { id: blockedUserId },
            unblockedDate: null, // Sadece aktif blokları kontrol et
          },
        });
    
        // Kullanıcı daha önce 2 defa blockladıysa, yeni blocklama yapamaz
        if (activeBlocks.length >= 2) {
          throw new ForbiddenException('You cannot unblock this user again.');
        }

    // En son blok kaydını bul
    const block = await this.blockRepository.findOne({
      where: {
        blocker: { id: blocker.id },
        blocked: { id: blockedUserId },
        unblockedDate: null, // Sadece aktif blokları kontrol et
      },
      order: { blockedDate: 'DESC' }, // Son blok kaydını bulmak için
    });

    if (!block) {
      throw new ForbiddenException('No active block record found.');
    }

    // Eğer `unblockedDate` zaten mevcutsa, kullanıcıya ikinci kez unblock yapılamaz
    if (block.unblockedDate) {
      throw new ForbiddenException('This user has already been unblocked.');
    }

    // Blok kaydını 'unblockedDate' ile güncelle
    block.unblockedDate = new Date();
    await this.blockRepository.save(block);
  }

  async isBlocked(blockerId: number, blockedUserId: number): Promise<boolean> {
    const block = await this.blockRepository.findOne({
      where: {
        blocker: { id: blockerId },
        blocked: { id: blockedUserId },
        unblockedDate: null, // UnblockedDate olan kayıtları dışarıda bırak
      },
    });
    return !!block;
  }

}