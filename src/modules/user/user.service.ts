import {
    BadRequestException,
    HttpException,
    HttpStatus,
    Injectable,
    InternalServerErrorException,
    NotFoundException,
  } from '@nestjs/common';
import { UsersEntity } from './user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CategoryEntity } from '../category/category.entity';
import * as bcrypt from 'bcrypt';
import { InfoService } from '../info/info.service';
import { InfoEntity } from '../info/info.entity';
import { InOutEntity } from '../in-out/in-out.entity';
import { PasswordService } from '../service/password.service';
import { UsersDeleteDto } from '../dto/user/delete.dto';
import { UserUpdateDto } from '../dto/user/update.dto';
import { AddUsersToCatsDto } from '../dto/user/add.user.to.cat.dto';
import { ClassroomEntity } from '../classroom/classroom.entity';
import { Role } from '../enum/role.enum';
import { AddStudentToClrDto } from '../dto/user/add.student.to.clr.dto';
import { JwtService } from '@nestjs/jwt';
import { UserCrEntity } from '../entity/user.cr.entity';
import { RequestEntity } from '../request/request.entity';
import { ConnectionEntity } from '../connection/connection.entity';

@Injectable()
export class UserService {
    
  usersService: any;
  softDelete: Date;
  
  constructor(
    @InjectRepository(UsersEntity)
    private usersRepository: Repository<UsersEntity>,
  
    @InjectRepository(CategoryEntity)
    private cRepository: Repository<CategoryEntity>,

    @InjectRepository(InOutEntity)
    private inOutRepository: Repository<InOutEntity>,

    @InjectRepository(UserCrEntity)
    private userCrRepository: Repository<UserCrEntity>,

    @InjectRepository(ClassroomEntity)
    private classroomRepository: Repository<ClassroomEntity>,

    @InjectRepository(RequestEntity)
    private requestRepository: Repository<RequestEntity>,

  
    private jwtService: JwtService,
    private infoService: InfoService,
    private passwordService:  PasswordService,
  ) {}

  // async findAll(userId: number): Promise<UsersEntity[]> {
  //   try {
  //     // Öncelikle kullanıcıyı bul
  //     const user = await this.usersRepository.findOne({ where: { id: userId }, relations: ['categories'] });
  //     if (!user) {
  //       throw new Error('User not found');
  //     }
  
  //     console.log('User: ', user);
  
  //     // Kullanıcının kategorilerini al
  //     const categories = user.categories;
  //     const categoryIds = categories.map(category => category.id);
  
  //     console.log('Categories: ', categories);
  //     console.log('CategoryIds: ', categoryIds);
  
  //     // Kategori ID'lerini kontrol et
  //     if (categoryIds.length === 0) {
  //       return [];
  //     }
  
  //     // Kullanıcının açtığı kategorilere ait sınıfları bul
  //     const classrooms = await this.userCrRepository
  //       .createQueryBuilder('user_cr')
  //       .leftJoinAndSelect('user_cr.classroom', 'classroom')
  //       .where('user_cr.addedBy = :userId', { userId })
  //       .andWhere('classroom.categoryId IN (:...categoryIds)', { categoryIds })
  //       .getMany();
  
  //     console.log('Classrooms: ', classrooms);
  
  //     const classroomIds = classrooms.map(userCr => userCr.classroom.id);
  
  //     console.log('ClassroomIds: ', classroomIds);
  
  //     // Sınıf ID'lerini kontrol et
  //     if (classroomIds.length === 0) {
  //       return [];
  //     }
  
  //     // Belirtilen sınıflara ait öğrencileri bul
  //     const usersInClassrooms = await this.userCrRepository
  //       .createQueryBuilder('user_cr')
  //       .leftJoinAndSelect('user_cr.user', 'user')
  //       .where('user_cr.classroomId IN (:...classroomIds)', { classroomIds })
  //       .getMany();
  
  //     console.log('UsersInClassrooms: ', usersInClassrooms);
  
  //     const userIds = usersInClassrooms.map(userCr => userCr.user.id);
  
  //     console.log('UserIds: ', userIds);
  
  //     // Kullanıcı ID'lerini kontrol et
  //     if (userIds.length === 0) {
  //       return [];
  //     }
  
  //     // Kullanıcıları ID'lerine göre bul
  //     const users = await this.usersRepository
  //       .createQueryBuilder('user')
  //       .where('user.id IN (:...userIds)', { userIds })
  //       .getMany();
  
  //     console.log('Users: ', users);
  
  //     return users;
  //   } catch (error) {
  //     console.error('Error in findAll method:', error);
  //     throw error;
  //   }
  // }
 
  async findOne(username: string): Promise<UsersEntity | undefined> {
      return this.usersRepository.findOne({ where: { username } });
  }

  findOneById(id: number) {
    return this.usersRepository.findOneBy({ id });
  }

  async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
      return await bcrypt.compare(password, hashedPassword);
  }

  async updateAccessToken(userId: number, accessToken: string): Promise<void> {
      const user = await this.inOutRepository.findOneBy({ id: userId});
      if (user) {
          user.accessToken = accessToken;
          await this.inOutRepository.save(user);
      }
  }
    
  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.usersService.findByUsername(username);
    if (user && await this.passwordService.comparePassword(password, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }
  
  async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
  }

  async joinCat(dto: AddUsersToCatsDto, userId: number): Promise<void> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ['categories'], // Kategorileri ilişkilendirin
    });
  
    if (!user) {
      throw new BadRequestException(`User with id '${userId}' not found.`);
    }
  
    // Check if user has 'teacher' or 'sub_teacher' role
    if (!this.hasTeacherRole([user.roles])) {
      throw new BadRequestException(`User with id '${userId}' does not have permission to be added to categories.`);
    }
  
    for (const categoryId of dto.categoryIds) {
      const category = await this.cRepository.findOne({
        where: { id: categoryId },
        relations: ['parent'],
      });
  
      if (!category) {
        throw new BadRequestException(`Category with id '${categoryId}' not found.`);
      }
  
      console.log('Category:', category);
  
      // Check if category supports direct assignment (parentId is not null)
      if (!category.parent) {
        throw new BadRequestException(`Cannot add user to category '${category.name}' because it does not support direct assignment.`);
      }
  
      // Check if user is already assigned to the category
      if (!user.categories.some(c => c.id === categoryId)) {
        await this.usersRepository.createQueryBuilder('user')
          .relation(UsersEntity, 'categories')
          .of(user)
          .add(category);
      }
    }
  }
  
  async addStdntToClr(addStudentToClrDto: AddStudentToClrDto, accessToken: string): Promise<void> {
    // JWT'den kullanıcı kimliğini al
    const decodedToken = this.jwtService.decode(accessToken) as { sub: number };
    const addedBy = decodedToken.sub;
  
    const { userId, classroomId } = addStudentToClrDto;
  
    try {
      // Kullanıcıyı ve sınıfı bul
      const user = await this.usersRepository.findOne({ where: { id: userId } });
      const classroom = await this.classroomRepository.findOne({ where: { id: classroomId } });
  
      if (!user || !classroom) {
        throw new HttpException(
          'User or class not found',
          HttpStatus.NOT_FOUND
        );
      }
  
      // requestRepository'de accepted = true ve kullanıcı için geçerli bir istek olup olmadığını kontrol et
      const existingRequest = await this.requestRepository.findOne({ 
        where: { 
          requester: { id: addedBy }, 
          requestee: user,
          accepted: true
        }
      });
  
      if (!existingRequest) {
        throw new HttpException(
          'There is no request to add this user to the class or your request was not accepted.',
          HttpStatus.FORBIDDEN
        );
      }
  
      // Kullanıcının zaten sınıfta olup olmadığını kontrol et
      const existingUserCr = await this.userCrRepository.findOne({
        where: {
          user: { id: userId },
          classroom: { id: classroomId }
        }
      });
  
      if (existingUserCr) {
        throw new HttpException(
          'This user is already added to the class.',
          HttpStatus.CONFLICT
        );
      }
  
      // UserCrEntity nesnesini oluşturarak kaydediyoruz
      const userCrEntity = this.userCrRepository.create({
        user: user,
        classroom: classroom,
        addedBy: { id: addedBy }
      });
  
      console.log('Decoded Token:', decodedToken);
      console.log('User:', user);
      console.log('Classroom:', classroom);
      console.log('Existing Request:', existingRequest);
  
      await this.userCrRepository.save(userCrEntity);
    } catch (error) {
      console.error('Error adding student to class:', error); // Daha detaylı hata günlüğü
      throw new HttpException(
        'An error occurred while adding the student to the class.',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }  

  private hasTeacherRole(roles: Role[]): boolean {
    return roles.some(role => [Role.Teacher].includes(role));
  }
  
  async update(id: number, data: UserUpdateDto) {
    try {
       const user = await this.usersRepository.findOne({ where: { id: id, username: data.username } });
  
      if (!user) {
        throw new NotFoundException('User not found!');
      }
  
      const updateMessages = [];
      const log = new InfoEntity();
      log.user = user;
  
      if (data.new_username) {
        const isUsernameTaken = await this.usersRepository.findOne({ where: { username: data.new_username } });
        if (isUsernameTaken && isUsernameTaken.id !== user.id) {
          throw new InternalServerErrorException("Username already taken!");
        }
        updateMessages.push('Username changed!');
        log.info = log.info ? `${log.info} Username has been changed.` : 'Username has been changed.';
      }
  
      if (data.email && data.email !== user.email) {
        updateMessages.push('Email has been updated!');
        log.info = log.info ? `${log.info} Email has been updated.` : 'Email has been updated.';
      }
  
      if (data.phone && data.phone !== user.phone) {
        updateMessages.push('Phone number has been updated!');
        log.info = log.info ? `${log.info} Phone number has been updated.` : 'Phone number has been updated.';
      }
  
      let hashedPassword = user.password;
      if (data.new_password) {
       if (data.new_password !== data.password_confirm) {
         throw new InternalServerErrorException("Passwords don't match!");
        }
       hashedPassword = await this.passwordService.hashPassword(data.new_password);
      }

      if ( hashedPassword !== user.password) {
        console.log(user.password)
        console.log(data.current_password);
        console.log(hashedPassword);
        
        updateMessages.push('Users password has been changed!');
        log.info = log.info ? `${log.info} Users password has been changed.` : 'Users password has been changed.';
      }
  
      if (data.current_password) {
        const res = await this.passwordService.comparePassword(data.current_password, user.password);
        if (res !== true) {
          throw new InternalServerErrorException("Current password is incorrect!");
        }
      }
  
      const updatedUser = { 
        ...user, 
        username: data.new_username || user.username, 
        email: data.email || user.email, 
        phone: data.phone || user.phone, 
        password: hashedPassword 
      };
      await this.usersRepository.save(updatedUser);
  
      if (log.info) {
        await this.infoService.addLog(log);
      }

      return {
        statusCode: 200,
        message: updateMessages.length > 0 ? updateMessages.join(' ') : 'Your profile has been updated!',
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message || error);
    }
  }
  
  async delete(deleteUserDto: UsersDeleteDto): Promise<string> {
    const { username } = deleteUserDto;
    try {
      const user = await this.usersRepository.findOne({ where: { username } });
      if (!user) {
        throw new NotFoundException('User not found!');
      }
      if (deleteUserDto.softDelete === true) {
        user.deletedAt = new Date();
        await this.usersRepository.save(user);
        return 'User was deleted with soft delete!';
      } else {
        await this.usersRepository.remove(user);
        return 'User was deleted with hard delete!';
      }
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      } else {
        throw new Error('An error occurred while deleting the user!');
      }
    }
  }

  async getUserCategories(userId: number): Promise<CategoryEntity[]> {
    const user = await this.usersRepository.findOne({ where: { id: userId }, relations: ['categories'] });
    return user ? user.categories : [];
  }

  async getUserClassrooms(userId: number): Promise<ClassroomEntity[]> {
    const user = await this.usersRepository.findOne({ where: { id: userId }, relations: ['classrooms'] });
    return user ? user.classrooms : [];
  }

  async getUserById(id: number): Promise<UsersEntity> {
    return this.usersRepository.findOne({where: {id}});
  }

  async hasCategory(userId: number, categoryId: number): Promise<boolean> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ['categories'],
    });
  
    if (!user) {
      return false;
    }
  
    return user.categories.some((category) => category.id === categoryId);
  }
/*
  async getUserPhone(userId: number, viewerId: number): Promise<string> {
  const user = await this.usersRepository.findOne({ where: { id: userId } });
  if (!user) throw new NotFoundException('User not found');

    const viewer = await this.usersRepository.findOne({ where: { id: viewerId } });
    if (!viewer) throw new NotFoundException('Viewer not found');

    if (user.roles !== Role.Teacher) {
      throw new ForbiddenException('Phone number is only visible for teachers');
    }

    switch (user.phoneVisibility) {
      case PhoneVisibility.Everyone:
        return user.phone;
      case PhoneVisibility.AllStudents:
        if (viewer.roles === Role.Student) return user.phone;
        break;
      case PhoneVisibility.MyStudents:
        if (await this.isMyStudent(user, viewer)) return user.phone;
        break;
      case PhoneVisibility.ApprovedOnly:
        if (await this.isApproved(user, viewer)) return user.phone;
        break;
    }
    throw new ForbiddenException('You do not have permission to view this phone number');
  }

  private async isMyStudent(teacher: UsersEntity, student: UsersEntity): Promise<boolean> {
    const relationship = await this.connectionRepository.findOne({ where: { requester: teacher, requestee: student, accepted: true } });
    return !!relationship;
  }

  private async isApproved(teacher: UsersEntity, student: UsersEntity): Promise<boolean> {
    const relationship = await this.connectionRepository.findOne({ where: { requester: teacher, requestee: student, accepted: true } });
    return !!relationship;
  }

  async sharePhone(teacherId: number, studentId: number): Promise<void> {
    const teacher = await this.usersRepository.findOne({ where: { id: teacherId } });
    const student = await this.usersRepository.findOne({ where: { id: studentId } });

    if (!teacher || !student) throw new NotFoundException('User not found');

    const relationship = await this.connectionRepository.findOne({ where: { requester: teacher, requestee: student } });
    if (!relationship) throw new NotFoundException('Relationship not found');

    relationship.accepted = true;
    await this.connectionRepository.save(relationship);
    await this.createLog('Phone shared', teacherId, studentId);
  }

  async unsharePhone(teacherId: number, studentId: number): Promise<void> {
    const teacher = await this.usersRepository.findOne({ where: { id: teacherId } });
    const student = await this.usersRepository.findOne({ where: { id: studentId } });

    if (!teacher || !student) throw new NotFoundException('User not found');

    const relationship = await this.connectionRepository.findOne({ where: { requester: teacher, requestee: student } });
    if (!relationship) throw new NotFoundException('Relationship not found');

    relationship.accepted = false;
    await this.connectionRepository.save(relationship);
    await this.createLog('Phone unshared', teacherId, studentId);
  }

  private async createLog(action: string, teacherId: number, studentId: number): Promise<void> {
    // Log oluşturma işlemi burada yapılır
    // Örnek: logService.createLog({ action, teacherId, studentId, timestamp: new Date() });
  }
*/
}