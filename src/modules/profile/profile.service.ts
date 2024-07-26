import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateProfileDto } from '../dto/profile/create.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersEntity } from '../user/user.entity';
import { In, Repository } from 'typeorm';
import { ProfileEntity } from './profile.entity';
import { InOutEntity } from '../in-out/in-out.entity';
import { JwtService } from '@nestjs/jwt';
import { Role } from '../enum/role.enum';
import { ClassroomEntity } from '../classroom/classroom.entity';
import { UserCrEntity } from '../entity/user.cr.entity';
import { UpdateProfileDto } from '../dto/profile/update.dto';
import { InfoEntity } from '../info/info.entity';
import { InfoService } from '../info/info.service';

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


        private infoService: InfoService,
        private jwtService: JwtService,
  ) {}

  async findAll(): Promise<UsersEntity[]> {
    return this.userRepository.find();
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
      .where('user_cr.classroomId IN (:...classroomIds)', { classroomIds: classrooms.map(c => c.id) })
      .andWhere('user.roles = :role', { role: Role.Student })
      .getMany();

    console.log('studentClassRelations:', studentClassRelations);

    // Extract student IDs from studentClassRelations
    const studentUsernames: string[] = studentClassRelations.map(relation => {
      // Eğer relation.user.username bir UsersEntity ise, ona erişim sağlayalım
      if (relation.user.username && typeof relation.user.username === 'object') {
        return relation.user.username || ''; // UsersEntity içindeki username alanına erişim
      }
      return ''; // Eğer kullanıcı yoksa boş döndür
    }).filter(username => username !== '');

    console.log('studentUsernames:', studentUsernames);
    
    const profiles = await this.profileRepository
      .createQueryBuilder('profile')
      .leftJoinAndSelect('profile.username', 'user') // İlişki adı doğru olduğundan emin olun
      .where('user.roles = :role', { role: Role.Student })
      .select(['profile.id', 'profile.name', 'profile.surname', 'profile.dateOfBirth', 'profile.gender', 'user.username'])
      .getMany();

    console.log('All Profiles That Are Students:', profiles);

      const completedProfiles = profiles.filter(profile =>
      profile.name && profile.surname && profile.dateOfBirth && profile.gender
    );

    console.log('Completed Profiles:', completedProfiles); // Debug log

    const incompletedProfiles = studentClassRelations.filter(relation => {
      const username = relation.user.username; // Username direkt burada string olsa bu şekilde kullanacağız
      return username && !profiles.some(profile => profile.username.username === username);
    });


  // Sonuçları konsola yazdır
  console.log('incompletedProfiles:', incompletedProfiles);

    return {
      completedProfiles,
      incompletedProfiles,
      message: incompletedProfiles.length > 0 
        ? 'There are students with incomplete profiles.'
        : 'All student profiles are complete.' 
    };
  }

  async findAllTeachers(): Promise<{ completedProfiles: ProfileEntity[], incompleteProfiles: ProfileEntity[], message: string }> {
    // Tüm profilleri öğretmenlerle birlikte getir
    const profiles = await this.profileRepository
      .createQueryBuilder('profile')
      .leftJoinAndSelect('profile.username', 'user') // İlişki adı doğru olduğundan emin olun
      .where('user.roles = :role', { role: Role.Teacher })
      .select(['profile.id', 'profile.name', 'profile.surname', 'profile.dateOfBirth', 'profile.gender', 'user.username'])
      .getMany();

    console.log('All Profiles That Are Teachers:', profiles);

    // Kullanıcıları öğretmen rollerine göre al
    const users = await this.userRepository.find({
      where: { roles: Role.Teacher },
    });
    console.log('Users:', users);

    // Eksik profiller için bir dizi oluştur
    const incompleteProfiles: ProfileEntity[] = [];

    // Kullanıcılar arasında eksik profilleri belirle
    users.forEach(user => {
      const profile = profiles.find(profile => profile.username.username === user.username);

      if (!profile || !profile.name || !profile.surname || !profile.dateOfBirth || !profile.gender) {
        incompleteProfiles.push({
          id: profile?.id ?? null,
          name: profile?.name ?? '',
          surname: profile?.surname ?? '',
          dateOfBirth: profile?.dateOfBirth ? new Date(profile.dateOfBirth) : new Date(), // Varsayılan tarih
          gender: profile?.gender ?? '',
          username: user, // Kullanıcı nesnesini doğrudan kullanın
          residence: profile?.residence ?? '', // Eksik olan diğer özellikler
          phone: profile?.phone ?? '', // Varsayılan değerler ekleyin
          email: profile?.email ?? '',
          roles: profile?.roles ?? ''
        } as ProfileEntity); // ProfileEntity türüne dönüştür
      }
    });

    // Tamamlanmış profilleri oluştur
    const completedProfiles = profiles.filter(profile =>
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
 
  async createProfile(data: CreateProfileDto, accessToken: string) {
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

      const exists = await this.profileRepository.findOne({ where: { name: data.name } });

      if (exists) {
        throw new NotFoundException('Profile already exists!');
      }

      console.log('IsActive:', isActive);
        
      const profile = new ProfileEntity();
      profile.username = user;
      profile.name = data.name;
      profile.surname = data.surname;
      profile.dateOfBirth = data.dateOfBirth;
      profile.gender = data.gender;
      profile.residence = data.residence;
      profile.phone = user;
      profile.email = user;
      profile.roles = user;

      console.log('Profile:', profile);      

      await this.profileRepository.save(profile);
  }

  async updateProfile (data: UpdateProfileDto, accessToken: string) {
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

}
