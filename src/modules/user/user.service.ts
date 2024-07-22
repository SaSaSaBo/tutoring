import {
    BadRequestException,
    ForbiddenException,
    HttpException,
    HttpStatus,
    Injectable,
    InternalServerErrorException,
    NotFoundException,
    UnauthorizedException,
  } from '@nestjs/common';
import { UsersEntity } from './user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Not, Repository } from 'typeorm';
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
  
    private jwtService: JwtService,
    private infoService: InfoService,
    private passwordService:  PasswordService,
  ) {}




















  async findAll(accessToken: string): Promise<UsersEntity[]> {
    const decodedToken = this.jwtService.verify(accessToken);
    const userId = decodedToken.sub;

    // Manager kullanıcısının açtığı kategorileri bul
    const managerCategories = await this.cRepository.find({
      where: { createdBy: { id: userId } },
    });

    const managerCategoryIds = managerCategories.map(category => category.id);

    // Bu kategorilerde bulunan teacher ve sub_teacher kullanıcılarını bul
    const teacherAndSubTeachers = await this.usersRepository.find({
      where: {
        roles: In([Role.Teacher, Role.SubTeacher]),
        categories: { id: In(managerCategoryIds) },
      },
    });

    const teacherAndSubTeacherIds = teacherAndSubTeachers.map(user => user.id);

    // Bu teacher ve sub_teacher kullanıcılarının açtığı sınıfları bul
    const classes = await this.classroomRepository.find({
      where: { creator: { id: In(teacherAndSubTeacherIds) } },
    });

    const classIds = classes.map(classEntity => classEntity.id);

    // Bu sınıflarda bulunan student kullanıcılarını bul
    const students = await this.usersRepository.find({
      where: {
        roles: Role.Student,
        classrooms: { id: In(classIds) },
      },
    });

    return [...teacherAndSubTeachers, ...students];
  }



















  async findAllStudents(): Promise<UsersEntity[]> {
      return this.usersRepository.find({ where: { roles: Role.Student } });
  }

  async findAllSubTeachers(): Promise<UsersEntity[]> {
    return this.usersRepository.find({
      where: {
        roles: IN([Role.Teacher, Role.SubTeacher]),
      },
    });
  }

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

  async addUserToCat(dto: AddUsersToCatsDto): Promise<void> {
    const user = await this.usersRepository.findOne({
      where: { id: dto.userId },
      relations: ['categories'],
    });
  
    if (!user) {
      throw new BadRequestException(`User with id '${dto.userId}' not found.`);
    }
  
    // Check if user has 'teacher' or 'sub_teacher' role
    if (!this.hasTeacherOrSubTeacherRole([user.roles])) {
      throw new BadRequestException(`User with id '${dto.userId}' does not have permission to be added to categories.`);
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
          'Kullanıcı veya sınıf bulunamadı',
          HttpStatus.NOT_FOUND
        );
      }

      // UserCrEntity nesnesini oluşturarak kaydediyoruz
      const userCrEntity = this.userCrRepository.create({
        user: user,
        classroom: classroom,
        addedBy:{id:addedBy}
      }); 

      await this.userCrRepository.save(userCrEntity);
    } catch (error) {
      throw new HttpException(
        'Öğrenci sınıfa eklenirken bir hata oluştu',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  private hasTeacherOrSubTeacherRole(roles: Role[]): boolean {
    return roles.some(role => [Role.Teacher, Role.SubTeacher].includes(role));
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
  
      if (data.role && data.role !== user.roles) {
        updateMessages.push('Users role has been changed!');
        log.info = log.info ? `${log.info} Users role has been changed.` : 'Users role has been changed.';
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
        roles: data.role || user.roles,
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

}

function IN(arg0: Role[]): Role | import("typeorm").FindOperator<Role> {
  throw new Error('Function not implemented.');
}
function NOT(arg0: Role[]): import("typeorm").FindOptionsWhere<UsersEntity> | import("typeorm").FindOptionsWhere<UsersEntity>[] {
  throw new Error('Function not implemented.');
}

