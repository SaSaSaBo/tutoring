import { BadRequestException, ForbiddenException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
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
import { AuthService } from '../auth/auth.service';
import { UserService } from '../user/user.service';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class ClassroomService {

    constructor(
        @InjectRepository(ClassroomEntity) 
        private readonly classroomRepository: Repository<ClassroomEntity>,

        @InjectRepository(UsersEntity) 
        private readonly userRepository: Repository<UsersEntity>,

        private infoService: InfoService,
        private jwtService: JwtService
    ) {}

    async getClassrooms() {
        return await this.classroomRepository.find();
    }

    async createClassroom(createData: CreateCRDto, accessToken: string): Promise<ClassroomEntity> {
        try {
            // Decode accessToken to get user information
            const decodedToken = this.jwtService.decode(accessToken) as { username: string };
    
            console.log('DecodedToken username: ', decodedToken.username);
    
            // Fetch user from database with categories and classrooms loaded
            const user = await this.userRepository.findOne({
                where: { username: decodedToken.username },
                relations: ['categories', 'classrooms'], // Load categories and classrooms relationships
            });
    
            console.log('User: ', user);
            
            if (!user) {
                throw new NotFoundException('User not found.');
            }
    
            // Check if user has any categories
            if (!user.categories || user.categories.length === 0) {
                throw new UnauthorizedException('User is not authorized to create classrooms.');
            }
    
            // Check user role and classroom creation rules
            if (user.roles.includes('sub_teacher') && user.classrooms.length > 0) {
                throw new UnauthorizedException('Sub_teacher is only allowed to create one classroom.');
            }
    
            // Create new classroom entity
            const classroom = new ClassroomEntity();
            classroom.cr_name = createData.cr_name;
            classroom.capability = createData.capability;
    
            // Save classroom to database
            const savedClassroom = await this.classroomRepository.save(classroom);
    
            // Establish many-to-many relationship
            user.classrooms.push(savedClassroom);
            await this.userRepository.save(user);
    
            return savedClassroom;
        } catch (error) {
            console.error('Error creating classroom:', error);
            throw new InternalServerErrorException('Failed to create classroom.', error);
        }
    }
    

    async updateClassroom(id: number, updateData: UpdateCRDto, accessToken: string) {
        try {
            const classroom = await this.classroomRepository.findOneBy({ id: id });
            console.log(classroom);
    
            if (!classroom) {
                throw new NotFoundException('Classroom not found!');
            }
    
            const updateMessage = [];
            const log = new InfoEntity();
            log.classroom = classroom;
    
            // Extract userId from accessToken
            const decodedToken = this.jwtService.decode(accessToken) as { sub: number };
            console.log(decodedToken);
    
            const sub = decodedToken.sub;
            const user = await this.userRepository.findOneBy({ id: sub });
    
            if (!user) {
                throw new NotFoundException('User not found!');
            }
    
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
    
    async deleteClassroom(deleteData: DeleteCRDto) {
        const { cr_name } = deleteData;

        try {
            const classroom = await this.classroomRepository.findOneBy({ cr_name: cr_name, deletedAt: null });
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
                throw new Error('An error occurred while deleting the classroom!');
              }
        }
    }

}