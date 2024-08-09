import { ForbiddenException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SuspendEntity } from './suspend.entity';
import { Repository } from 'typeorm';
import { UsersEntity } from '../user/user.entity';

@Injectable()
export class SuspendService {
  private readonly logger = new Logger(SuspendService.name);

  constructor(
    @InjectRepository(SuspendEntity)
    private suspendRepository: Repository<SuspendEntity>,

    @InjectRepository(UsersEntity)
    private userRepository: Repository<UsersEntity>,
  ) {}

  // Kullanıcıyı suspend et
  async suspend(userId: number, currentUserRole: string): Promise<SuspendEntity> {
    this.logger.log(`Suspending user with ID: ${userId}`);

    if (currentUserRole !== 'manager') {
      this.logger.error(`Unauthorized attempt to suspend by role: ${currentUserRole}`);
      throw new Error('Only managers can suspend users.');
    }

    const user = await this.findUserById(userId);
    if (!user) {
      this.logger.error(`User with ID ${userId} not found.`);
      throw new Error('User not found.');
    }

    this.logger.log(`Found user: ${JSON.stringify(user)}`);

    // Check if a suspend record already exists
    let suspendEntity = await this.suspendRepository.findOne({
      where: { suspendId: { id: userId }, deletedAt: false },
    });

    if (!suspendEntity) {
      // Create a new suspend record
      suspendEntity = new SuspendEntity();
      suspendEntity.suspendId = user;
      suspendEntity.suspendDate = new Date();
      suspendEntity.unSuspendDate = null; // Ensure unSuspendDate is cleared
    } else {
      // Update the existing record
      suspendEntity.suspendDate = new Date();
      suspendEntity.unSuspendDate = null; // Ensure unSuspendDate is cleared
    }

    const savedSuspendEntity = await this.suspendRepository.save(suspendEntity);
    this.logger.log(`User suspended: ${JSON.stringify(savedSuspendEntity)}`);

    return savedSuspendEntity;
  }

  async unSuspend(userId: number, currentUserRole: string): Promise<{ success: boolean }> {
    this.logger.log(`Unsuspending user with ID: ${userId}`);

    if (currentUserRole !== 'manager') {
        this.logger.error(`Unauthorized attempt to unsuspend by role: ${currentUserRole}`);
        throw new ForbiddenException('Only managers can unsuspend users.');
    }

    // Find the suspended entity based on the userId
    const suspendEntity = await this.suspendRepository.findOne({
        where: {
            suspendId: { id: userId }, // Use the user ID to match the suspendId
            deletedAt: false,
        },
        relations: ['suspendId'] // Ensure relationships are loaded
    });

    if (!suspendEntity) {
        // Check if the user exists
        const userExists = await this.userRepository.findOne({ where: { id: userId } });

        if (userExists) {
            // The user exists but is not suspended or already unsuspended
            this.logger.error(`Suspended user with ID ${userId} not found or already unsuspended.`);
            throw new NotFoundException('User is not suspended or already unsuspended.');
        } else {
            // The user does not exist
            this.logger.error(`User with ID ${userId} not found.`);
            throw new NotFoundException('User not found.');
        }
    }

    this.logger.log(`Found suspended user: ${JSON.stringify(suspendEntity)}`);

    // Update the suspendEntity
    suspendEntity.unSuspendDate = new Date(); // Set the unSuspendDate
    suspendEntity.deletedAt = true; // Mark as deleted

    try {
        await this.suspendRepository.save(suspendEntity);
        this.logger.log(`User unsuspended successfully: ${JSON.stringify(suspendEntity)}`);
        return { success: true };
    } catch (error) {
        this.logger.error('Error while unsuspending user:', error.stack);
        throw new InternalServerErrorException('Failed to unsuspend user.');
    }
  }

  private async findUserById(userId: number): Promise<UsersEntity> {
    this.logger.log(`Finding user by ID: ${userId}`);
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (user) {
      this.logger.log(`User found: ${JSON.stringify(user)}`);
    } else {
      this.logger.error(`User with ID ${userId} not found.`);
    }
    return user;
  }

}