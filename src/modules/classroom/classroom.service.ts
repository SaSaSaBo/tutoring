import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { UpdateCRDto } from '../dto/classroom/update.dto';
import { DeleteCRDto } from '../dto/classroom/delete.dto';
import { CreateCRDto } from '../dto/classroom/create.dto';
import { ClassroomEntity } from './classroom.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InfoEntity } from '../info/info.entity';
import { InfoService } from '../info/info.service';
import { UsersEntity } from '../user/user.entity';
import { JwtService } from '@nestjs/jwt';
import { UserCrEntity } from '../entity/user.cr.entity';

@Injectable()
export class ClassroomService {

    constructor(
        @InjectRepository(ClassroomEntity) 
        private readonly classroomRepository: Repository<ClassroomEntity>,

        @InjectRepository(UsersEntity) 
        private readonly userRepository: Repository<UsersEntity>,

        @InjectRepository(UserCrEntity)
        private readonly userCrRepository: Repository<UserCrEntity>,

        private infoService: InfoService,
        private jwtService: JwtService
    ) {}

    async getClassrooms(): Promise<ClassroomEntity[]> {
        return await this.classroomRepository.find();
    }

    async getClassroomsForTeachs(userId: number) {
        try {
            return await this.userCrRepository
            .createQueryBuilder('userCr')
            .innerJoinAndSelect('userCr.user', 'user')
            .innerJoinAndSelect('userCr.classroom', 'classroom')
            .where('userCr.addedBy = :userId', { userId })
            .getMany();
        
        } catch (error) {
            console.error('Error decoding token:', error);
            throw new Error('Failed to decode token');
        }
    }

    async getClassroomsForStdnt() {
        return await this.classroomRepository.find({
            relations: ['creator'],
        });
    }

    async createClassroom(createData: CreateCRDto, accessToken: string): Promise<ClassroomEntity> {
        try {
            console.log('AccessToken: ', accessToken);
    
            // Decode accessToken to get user information
            const decodedToken = this.jwtService.decode(accessToken);
            console.log('DecodedToken: ', decodedToken);
    
            if (!decodedToken || typeof decodedToken !== 'object') {
                throw new UnauthorizedException('Invalid access token.');
            }
    
            // Fetch user from database with categories loaded
            console.log('Fetching user from database...');
            const user = await this.userRepository.findOne({
                where: { username: decodedToken.username },
                relations: ['categories'], // Load categories relationship
            });
    
            if (!user) {
                console.error('User not found.');
                throw new NotFoundException('User not found.');
            }
    
            console.log('User found: ', user);
    
            // Check if user has any categories that allow classroom creation
            const canCreateClassroom = user.categories.length > 0;
            console.log('Can create classroom: ', canCreateClassroom);
    
            if (!canCreateClassroom) {
                throw new UnauthorizedException('User is not authorized to create classrooms.');
            }
    
            // Validate that categoryId is provided
            if (!createData.categoryId) {
                throw new BadRequestException('categoryId is required.');
            }
    
            // Check if the user is associated with the given categoryId
            console.log('Checking user categories for categoryId: ', createData.categoryId);
            const category = user.categories.find(cat => cat.id === createData.categoryId);
            console.log('Category found: ', category);
    
            if (!category) {
                console.error('User is not authorized for the specified category.');
                throw new UnauthorizedException('User is not authorized to create classrooms in the specified category.');
            }
    
            // Create new classroom entity
            const classroom = new ClassroomEntity();
            classroom.cr_name = createData.cr_name;
            classroom.capability = createData.capability;
            classroom.creator = user; // Correctly set the creator relation
            classroom.category = category; // Correctly set the category relation
    
            // Save classroom to database
            console.log('Saving classroom to database...');
            return await this.classroomRepository.save(classroom);
        } catch (error) {
            console.error('Error creating classroom: ', error.message);
            throw new InternalServerErrorException('Failed to create classroom.', error);
        }
    }

    async updateClassroom(id: number, updateData: UpdateCRDto, accessToken: string) {
        try {
            // Decode accessToken to get user information
            const decodedToken = this.jwtService.decode(accessToken) as { sub: number };
            const sub = decodedToken.sub;
    
            // Fetch user from database with classrooms loaded
            const user = await this.userRepository.findOne({
                where: { id: sub },
                relations: ['classrooms'], // Load classrooms relationship
            });
    
            if (!user) {
                throw new NotFoundException('User not found!');
            }
    
            // Check if the classroom belongs to the user
            const classroom = user.classrooms.find(classroom => classroom.id === id);
    
            if (!classroom) {
                throw new UnauthorizedException('User is not authorized to update this classroom.');
            }
    
            const updateMessage = [];
            const log = new InfoEntity();
            log.classroom = classroom;
            log.user = user;  // user nesnesini doğrudan log.user'a atayın
    
            if (updateData.new_cr_name) {
                const isCRnameTaken = await this.classroomRepository.findOne({ where: { cr_name: updateData.new_cr_name } });
                if (isCRnameTaken && isCRnameTaken.id !== classroom.id) {
                    throw new BadRequestException('Classroom name already taken!');
                }
                updateMessage.push('Classroom name updated!');
                log.info = log.info ? `${log.info} Classroom ${classroom.id}: Class name has been changed.` : `Classroom ${classroom.id}: Class name has been changed.`;
            }
    
            if (updateData.new_capacity) {
                updateMessage.push('Classroom capacity updated!');
                log.info = log.info ? `${log.info} Classroom ${classroom.id}: Capacity has been changed.` : `Classroom ${classroom.id}: Capacity has been changed.`;
            }
    
            const updateCr = {
                ...classroom,
                cr_name: updateData.new_cr_name || classroom.cr_name,
                capability: updateData.new_capacity || classroom.capability,
            };
            await this.classroomRepository.save(updateCr);
    
            if (log.info) {
                await this.infoService.addLog(log);
            }
    
            return {
                statusCode: 200,
                message: updateMessage.length > 0 ? updateMessage.join(', ') : 'Classroom updated!',
            };
        } catch (error) {
            throw new InternalServerErrorException(error.message || error);
        }
    }

    async deleteClassroom(deleteData: DeleteCRDto, accessToken: string) {

        console.log('DeleteData: ', deleteData);
        
        try {
            if (!deleteData || !deleteData.cr_name) {
                throw new BadRequestException('Invalid delete request. Missing cr_name.');
            }
    
            // Decode accessToken to get user information
            const decodedToken = this.jwtService.decode(accessToken) as { sub: number };
            const sub = decodedToken.sub;

            console.log('DecodedToken sub: ', sub);
            
            // Fetch user from database with classrooms loaded
            const user = await this.userRepository.findOne({
                where: { id: sub },
                relations: ['classrooms'], // Load classrooms relationship
            });

            console.log('User: ', user);
            
    
            if (!user) {
                throw new NotFoundException('User not found!');
            }
    
            // Find the classroom the user wants to delete
            const classroom = user.classrooms.find(classroom => classroom.cr_name === deleteData.cr_name && classroom.deletedAt === null);
    
            if (!classroom) {
                throw new NotFoundException('Classroom not found!');
            }
    
            if (deleteData.softDelete === true) {
                classroom.deletedAt = new Date();
                await this.classroomRepository.save(classroom);
                return 'Classroom was deleted with soft delete!';
            } else {
                await this.classroomRepository.remove(classroom);
                return 'Classroom was deleted with hard delete!';
            }        
        } catch (error) {
            if (error instanceof NotFoundException || error instanceof BadRequestException) {
                throw error;
            } else {
                throw new InternalServerErrorException('An error occurred while deleting the classroom!', error);
            }
        }
    }

}