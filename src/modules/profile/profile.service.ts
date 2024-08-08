import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateProfileDto, CreateTProfileDto } from '../dto/profile/create.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersEntity } from '../user/user.entity';
import { Between, Repository } from 'typeorm';
import { ProfileEntity } from './profile.entity';
import { InOutEntity } from '../in-out/in-out.entity';
import { JwtService } from '@nestjs/jwt';
import { ClassroomEntity } from '../classroom/classroom.entity';
import { UserCrEntity } from '../entity/user.cr.entity';
import { UpdateProfileDto } from '../dto/profile/update.dto';
import { InfoEntity } from '../info/info.entity';
import { InfoService } from '../info/info.service';
import { PasswordService } from '../service/password.service';
import { TProfileEntity } from './tprofile.entity';
import { PhoneVisibility } from '../enum/visibility.enum';
import { Role } from '../enum/role.enum';
import { ConnectionEntity } from '../connection/connection.entity';

@Injectable()
export class ProfileService {

  constructor(
        @InjectRepository(UsersEntity) 
        private userRepository: Repository<UsersEntity>,

        @InjectRepository(InOutEntity)
        private inOutRepository: Repository<InOutEntity>,

        @InjectRepository(ProfileEntity)
        private profileRepository: Repository<ProfileEntity>,

        @InjectRepository(ClassroomEntity)
        private classroomRepository: Repository<ClassroomEntity>,

        @InjectRepository(UserCrEntity)
        private userCrRepository: Repository<UserCrEntity>,

        @InjectRepository(TProfileEntity)
        private tProfileRepository: Repository<TProfileEntity>,

        @InjectRepository(ConnectionEntity)
        private connectionRepository: Repository<ConnectionEntity>,


        private infoService: InfoService,
        private jwtService: JwtService,
  ) {}

  async findAll(): Promise<{ users: UsersEntity[], studentCount: number, teacherCount: number }> {
    const users = await this.userRepository.find();
  
    const studentCount = await this.userRepository.count({ where: { roles: Role.Student } });
    const teacherCount = await this.userRepository.count({ where: { roles: Role.Teacher } });
  
    return { users, studentCount, teacherCount };
  }
  
  async findAllDate(month?: number, year?: number): Promise<{ users: UsersEntity[], studentCount: number, teacherCount: number }> {
    let dateCondition = {};
  
    if (month && year) {
      // Month and year are both provided
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59, 999); // Last day of the month
      dateCondition = { created_at: Between(startDate, endDate) };
    } else if (year) {
      // Only year is provided
      const startDate = new Date(year, 0, 1);
      const endDate = new Date(year, 11, 31, 23, 59, 59, 999); // Last day of the year
      dateCondition = { created_at: Between(startDate, endDate) };
    } else if (month) {
      // Only month is provided, assume current year
      const currentYear = new Date().getFullYear();
      const startDate = new Date(currentYear, month - 1, 1);
      const endDate = new Date(currentYear, month, 0, 23, 59, 59, 999); // Last day of the month
      dateCondition = { created_at: Between(startDate, endDate) };
    }
  
    const users = await this.userRepository.find({
      where: dateCondition,
    });
  
    const studentCount = await this.userRepository.count({
      where: {
        roles: Role.Student,
        ...dateCondition,
      },
    });
  
    const teacherCount = await this.userRepository.count({
      where: {
        roles: Role.Teacher,
        ...dateCondition,
      },
    });
  
    return { users, studentCount, teacherCount };
  }

  async findAllStudents(accessToken: string) {
    const decodedToken: any = this.jwtService.decode(accessToken);
    const userId = decodedToken.sub;
  
    if (!userId) {
      throw new InternalServerErrorException('Invalid token or user ID not found.');
    }
  
    // Kullanıcının oluşturduğu sınıfları bulun
    const classrooms = await this.classroomRepository
      .createQueryBuilder('classroom')
      .where('classroom.creatorId = :userId', { userId })
      .getMany();
  
    if (classrooms.length === 0) {
      throw new InternalServerErrorException('No classrooms found for this user.');
    }
  
    console.log('Classrooms:', classrooms);
  
    // Get student-class relations
    const studentClassRelations = await this.userCrRepository
      .createQueryBuilder('user_cr')
      .leftJoinAndSelect('user_cr.user', 'user')
      .leftJoinAndSelect('user_cr.classroom', 'classroom')
      .where('user_cr.classroom.id IN (:...classroomIds)', { classroomIds: classrooms.map(c => c.id) })
      .andWhere('user.roles = :role', { role: Role.Student })
      .getMany();
  
    console.log('studentClassRelations:', studentClassRelations);
  
    // Extract student usernames
    const studentUsernames: string[] = studentClassRelations.map(relation => {
      return relation.user.username || ''; // Username içeriğini al
    }).filter(username => username !== '');
  
    console.log('studentUsernames:', studentUsernames);
  
    // Kullanıcı profillerini alın
    const profiles = await this.profileRepository
      .createQueryBuilder('profile')
      .leftJoinAndSelect('profile.username', 'user')
      .where('user.roles = :role', { role: Role.Student })
      .select(['profile.id', 'profile.name', 'profile.surname', 'profile.dateOfBirth', 'profile.gender', 'user.username'])
      .getMany();
  
    console.log('All Profiles That Are Students:', profiles);
  
    // Tamamlanmış profilleri filtrele
    const completedProfiles = profiles.filter(profile =>
      profile.name && profile.surname && profile.dateOfBirth && profile.gender
    );
  
    console.log('Completed Profiles:', completedProfiles); // Debug log
  
    // Eksik profiller için dizi oluştur
    const incompletedProfiles = studentClassRelations.filter(relation => {
      const username = relation.user.username;
      return username && !profiles.some(profile => profile.username.username === username);
    });
  
    // Eksik profilleri ve sınıfları bağlayın
    const incompletedProfilesWithClasses = incompletedProfiles.map(relation => {
      return {
        id: relation.user.id,
        user: relation.user,
        classrooms: classrooms.filter(classroom => 
          studentClassRelations.some(rel => rel.user.id === relation.user.id && rel.classroom.id === classroom.id)
        )
      };
    });
  
    // Tamamlanmış profilleri ve sınıfları bağlayın
    const completedProfilesWithClasses = completedProfiles.map(profile => {
      return {
        ...profile,
        classrooms: classrooms.filter(classroom => 
          studentClassRelations.some(rel => rel.user.username === profile.username.username && rel.classroom.id === classroom.id)
        )
      };
    });
  
    // Sonuçları konsola yazdır
    console.log('Completed Profiles with Classes:', completedProfilesWithClasses);
    console.log('Incompleted Profiles with Classes:', incompletedProfilesWithClasses);
  
    return {
      completedProfiles: completedProfilesWithClasses,
      incompletedProfiles: incompletedProfilesWithClasses,
      message: incompletedProfilesWithClasses.length > 0 
        ? 'There are students with incomplete profiles.'
        : 'All student profiles are complete.' 
    };
  }

  async findAllTeachers(): Promise<{ completedProfiles: TProfileEntity[], incompleteProfiles: ProfileEntity[], message: string }> {
    // Tüm profilleri öğretmenlerle birlikte getir
    const tprofiles = await this.tProfileRepository
      .createQueryBuilder('tprofile')
      .leftJoinAndSelect('tprofile.username', 'user') // İlişki adı doğru olduğundan emin olun
      .select(['tprofile.id', 'user.username', 'tprofile.name', 'tprofile.surname', 'tprofile.dateOfBirth', 'tprofile.gender', 'tprofile.place' ])
      .getMany();
  
    console.log('All Profiles That Are Teachers:', tprofiles);
  
    // Kullanıcıları öğretmen rollerine göre al
    const users = await this.userRepository.find({
      where: { roles: Role.Teacher },
    });
    console.log('Users:', users);
  
    // Eksik profiller için bir dizi oluştur
    const incompleteProfiles: ProfileEntity[] = [];
  
    // Kullanıcılar arasında eksik profilleri belirle
    users.forEach(user => {
      const profile = tprofiles.find(profile => profile.username.username === user.username);
  
      if (!profile || !profile.name || !profile.surname || !profile.dateOfBirth || !profile.gender) {
        incompleteProfiles.push({
          id: profile?.id ?? null,
          name: profile?.name ?? '',
          surname: profile?.surname ?? '',
          dateOfBirth: profile?.dateOfBirth ? new Date(profile.dateOfBirth) : new Date(), // Varsayılan tarih
          gender: profile?.gender ?? '',
          username: user, // Kullanıcı nesnesini doğrudan kullanın
          residence: profile?.place ?? '', // Eksik olan diğer özellikler
          phone: profile?.phone ?? '', // Varsayılan değerler ekleyin
          email: profile?.email ?? '',
        } as ProfileEntity); // ProfileEntity türüne dönüştür
      }
    });
  
    // Tamamlanmış profilleri oluştur
    const completedProfiles = tprofiles.filter(profile =>
      profile.name && profile.surname && profile.dateOfBirth && profile.gender
    );
  
    console.log('Completed Profiles:', completedProfiles); // Debug log
    console.log('Incomplete Profiles:', incompleteProfiles); // Debug log
  
    // Sonuçları döndür
    return {
      completedProfiles,
      incompleteProfiles,
      message: incompleteProfiles.length > 0 
        ? 'There are users with incomplete profiles.'
        : 'All profiles are complete.' 
    };
  }

  async callTeachers(accessToken: string) {
    // Decode the token to get the user ID
    const decodedToken = this.jwtService.decode(accessToken);
    const userId = decodedToken.sub;
  console.log('User ID:', userId);
  
    // Find connections where either requesterId or requesteeId is the student user
    const connections = await this.connectionRepository
      .createQueryBuilder('connection')
      .leftJoinAndSelect('connection.requester', 'requester')
      .leftJoinAndSelect('connection.requestee', 'requestee')
      .where('requester.id = :userId OR requestee.id = :userId', { userId })
      .andWhere('(requester.roles = :studentRole OR requestee.roles = :studentRole)', { studentRole: 'student' })
      .getMany();

      console.log('Connections:', connections);      
  
    // Extract teacher usernames from the connections
    const teacherUsernames = connections.flatMap(connection => {
      const teacherUsernames = [];
      if (connection.requester.roles === 'teacher') {
        teacherUsernames.push(connection.requester.username);
      }
      if (connection.requestee.roles === 'teacher') {
        teacherUsernames.push(connection.requestee.username);
      }
      return teacherUsernames;
    });
  
    return teacherUsernames;
  }
  
  async createProfile(data: CreateProfileDto & CreateTProfileDto, accessToken: string) {
    const decodedToken = this.jwtService.decode(accessToken);
    const user = await this.userRepository.findOneBy({ id: decodedToken.sub });

      console.log('Service: Decoded Token:', decodedToken);
        
      console.log('Service: User:', user);
  
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const check = await this.userRepository.findOne({ where: { username: data.username } });

    if (check.username !== decodedToken.username) {
      throw new NotFoundException('User\'s username do not match!');
    }
                
    const isActive = await this.inOutRepository.findOneBy({ user: user, inOut: 'login' });
    if (!isActive) {
      throw new Error('User must be logged in first!');
    }

      console.log('IsActive:', isActive);
        
    if (decodedToken.role === 'teacher') {
        // Check if a teacher profile already exists
      const exists = await this.tProfileRepository.findOne({ where: { name: data.name } });
    
      if (exists) {
        throw new NotFoundException('Teacher profile already exists!');
      }
    
        console.log('Exists:', exists);
    
        // Create a new teacher profile
      const tProfile = new TProfileEntity();
      tProfile.username = user;
      tProfile.name = data.name;
      tProfile.surname = data.surname;
      tProfile.dateOfBirth = data.dateOfBirth;
      tProfile.gender = data.gender;
      tProfile.phone = user;
      tProfile.email = user;
      tProfile.alma_mater = data.alma_mater;
      tProfile.area = data.area;
      tProfile.explanation = data.explanation;
      tProfile.place = data.place;
    
        console.log('TProfile:', tProfile);
    
      await this.tProfileRepository.save(tProfile);
    } else {
        // Check if a regular profile already exists
      const exists = await this.profileRepository.findOne({ where: { name: data.name } });
    
      if (exists) {
        throw new NotFoundException('Profile already exists!');
      }
    
        console.log('Exists:', exists);
      
      const profile = new ProfileEntity();
      profile.username = user;
      profile.name = data.name;
      profile.surname = data.surname;
      profile.dateOfBirth = data.dateOfBirth;
      profile.gender = data.gender;
      profile.residence = data.residence;
      profile.phone = user;
      profile.email = user;

      console.log('Profile:', profile);      

      await this.profileRepository.save(profile);
      }
  }

  async updateProfile(data: UpdateProfileDto, accessToken: string) {
    const decodedToken = this.jwtService.decode(accessToken) as { username: string };
    if (!decodedToken || !decodedToken.username) {
      throw new UnauthorizedException('Invalid token');
    }
  
    // Find the user by the decoded username
    const user = await this.userRepository.findOneBy({ username: decodedToken.username });
    if (!user) {
      throw new NotFoundException('User not found');
    }
  
    // Find the user profile by the user entity
    const userProfile = await this.profileRepository.findOne({ where: { username: user } });
    if (!userProfile) {
      throw new NotFoundException('User profile not found');
    }
  
    console.log('Service: User:', user);
    console.log('Service: Decoded Token:', decodedToken);
    console.log('Service: UserProfile:', userProfile);
  
    // Compare usernames
    if (data.username !== decodedToken.username) {
      throw new BadRequestException('Usernames do not match');
    }
  
    const updateMessages = [];
    const log = new InfoEntity();
    log.userProfile = userProfile;
    log.user = user;
  
    if (data.name) {
      updateMessages.push('Name has been changed!');
      log.info = log.info ? `${log.info} Name has been changed.` : 'Name has been changed.';
    }
  
    if (data.surname) {
      updateMessages.push('Surname has been changed!');
      log.info = log.info ? `${log.info} Surname has been changed.` : 'Surname has been changed.';
    }
  
    if (data.dateOfBirth) {
      updateMessages.push('Birthdate has been changed!');
      log.info = log.info ? `${log.info} Birthdate has been changed.` : 'Birthdate has been changed.';
    }
  
    if (data.gender) {
      updateMessages.push('Gender has been changed!');
      log.info = log.info ? `${log.info} Gender has been changed.` : 'Gender has been changed.';
    }
  
    if (data.residence) {
      updateMessages.push('Residence has been changed!');
      log.info = log.info ? `${log.info} Residence has been changed.` : 'Residence has been changed.';
    }
  
    // Update password if provided and matches the confirmation
    let hashedPassword = user.password;


    console.log('Hashed Password:', hashedPassword);
    console.log('Password: ', data.password);
    console.log('Password Confirm: ', data.password_confirm);
    
    
  
    const updatedUser = { 
      ...userProfile, 
      name: data.name || userProfile.name, 
      surname: data.surname || userProfile.surname, 
      dateOfBirth: data.dateOfBirth || userProfile.dateOfBirth, 
      residence: data.residence || userProfile.residence, 
    };
  
    await this.profileRepository.save(updatedUser);
  
    if (log.info) {
      await this.infoService.addLog(log);
    }
  
    return {
      statusCode: 200,
      message: updateMessages.length > 0 ? updateMessages.join(' ') : 'Your profile has been updated!',
    };
  }

  async getProfileById(profileId: number, requester: UsersEntity): Promise<ProfileEntity> {
    const profile = await this.profileRepository.findOne({
        where: { id: profileId },
    });

    if (!profile) {
        throw new Error('Profile not found');
    }

    // Check visibility
    switch (profile.phoneVisibility) {
        case PhoneVisibility.Everyone:
            return profile;
        case PhoneVisibility.AllStudents:
            // Check if requester is a student
            if (requester.roles === 'student') {
                return profile;
            }
            break;
        case PhoneVisibility.AllTeachers:
            // Check if requester is a teacher
            if (requester.roles === 'teacher') {
                return profile;
            }
            break;
        case PhoneVisibility.MyTeachers:
            // Check if requester is a teacher and is listed as a teacher for this profile's owner
            if (requester.roles === 'teacher' && await this.isTeacherOf(requester, profile.ownerId)) {
                return profile;
            }
            break;
        case PhoneVisibility.MyStudents:
            // Check if requester is a student and is listed as a student for this profile's owner
            if (requester.roles === 'student' && await this.isStudentOf(requester, profile.ownerId)) {
                return profile;
            }
            break;
        case PhoneVisibility.ApprovedOnly:
            // Check if requester is approved
            if (await this.isApproved(requester, profile.ownerId)) {
                return profile;
            }
            break;
        default:
            throw new Error('Invalid phone visibility setting');
    }

    throw new Error('Access denied');
  }

  async getProfileByIdForT(profileId: number, requester: UsersEntity): Promise<TProfileEntity> {
    const profile = await this.tProfileRepository.findOne({
        where: { id: profileId },
    });

    if (!profile) {
        throw new Error('Profile not found');
    }

    // Check visibility
    switch (profile.phoneVisibility) {
        case PhoneVisibility.Everyone:
            return profile;
        case PhoneVisibility.AllStudents:
            // Check if requester is a student
            if (requester.roles === 'student') {
                return profile;
            }
            break;
        case PhoneVisibility.AllTeachers:
            // Check if requester is a teacher
            if (requester.roles === 'teacher') {
                return profile;
            }
            break;
        case PhoneVisibility.MyTeachers:
            // Check if requester is a teacher and is listed as a teacher for this profile's owner
            if (requester.roles === 'teacher' && await this.isTeacherOf(requester, profile.ownerId)) {
                return profile;
            }
            break;
        case PhoneVisibility.MyStudents:
            // Check if requester is a student and is listed as a student for this profile's owner
            if (requester.roles === 'student' && await this.isStudentOf(requester, profile.ownerId)) {
                return profile;
            }
            break;
        case PhoneVisibility.ApprovedOnly:
            // Check if requester is approved
            if (await this.isApproved(requester, profile.ownerId)) {
                return profile;
            }
            break;
        default:
            throw new Error('Invalid phone visibility setting');
    }

    throw new Error('Access denied');
  }

  private async isTeacherOf(requester: UsersEntity, ownerId: number): Promise<boolean> {
      // Implement logic to check if requester is a teacher of the owner
      return true;
  }

  private async isStudentOf(requester: UsersEntity, ownerId: number): Promise<boolean> {
      // Implement logic to check if requester is a student of the owner
      return true;
  }

  private async isApproved(requester: UsersEntity, ownerId: number): Promise<boolean> {
      // Implement logic to check if requester is approved by the owner
      return true;
  }

  async sharePhone(profileId: number, userId: number): Promise<void> {
    // Logic to share phone number with a specific user
    await this.updateShareStatus(profileId, userId, true);
  }

  async unsharePhone(profileId: number, userId: number): Promise<void> {
    // Logic to unshare phone number with a specific user
    await this.updateShareStatus(profileId, userId, false);
  }

  private async updateShareStatus(profileId: number, userId: number, share: boolean): Promise<void> {
    // Implement logic to update sharing status in the database
    // Add logging here if needed
  }
  
}