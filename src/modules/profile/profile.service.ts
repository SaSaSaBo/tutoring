import { roles } from './../enum/role.enum';
import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
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


        private jwtService: JwtService,
    ) {}

    
  async findAll(): Promise<UsersEntity[]> {
    return this.userRepository.find();
  }

// async findAllStudents(accessToken: string): Promise<{ completedProfiles: ProfileEntity[], incompleteProfiles: ProfileEntity[], message: string }> {
//   // Token'ı çözümleyerek kullanıcı ID'sini alın
//   const decodedToken: any = this.jwtService.decode(accessToken);
//   const userId = decodedToken.sub;

//   if (!userId) {
//     throw new InternalServerErrorException('Invalid token or user ID not found.');
//   }

//   // Kullanıcının oluşturduğu sınıfları bulun
//   const classrooms = await this.classroomRepository
//     .createQueryBuilder('classroom')
//     .where('classroom.creatorId = :userId', { userId })
//     .getMany();

//   if (classrooms.length === 0) {
//     throw new InternalServerErrorException('No classrooms found for this user.');
//   }

//   console.log('Classrooms:', classrooms);

//   // Tüm profilleri ve ilişkili kullanıcıları al
//   const allProfiles = await this.profileRepository.find({
//     relations: ['username'], // Kullanıcı ile ilişkilendirilmiş olanları da getir
//   });

//   // `profileMap`'inizi oluşturun
// const profileMap = new Map<string, any>();
// allProfiles.forEach(profile => {
//   profileMap.set(profile.username.toString(), profile);
// });

// // `students` listesini alın
// const students = await this.userRepository.find({
//   where: { roles: In([Role.Student]) }
// });

//   console.log('All Students:', students);

// // Profil bulunmayan öğrencileri belirleyin
// const studentsWithoutProfiles = students.filter(student => !profileMap.has(student.username));

// console.log('Students Without Profiles:', studentsWithoutProfiles);
  
//   // Öğrencileri filtrele
//   const studentsWithProfiles = allProfiles.filter(profile => 
//     profile.username.roles.includes(Role.Student)
//   );

//   console.log('All Students With Profiles:', studentsWithProfiles);

// // Öğrencilerden profil bulunmayanları belirleyin
// // const studentsWithoutProfiles = students.filter(student => 
// //   !allProfiles.some(profile => profile.username.toString() === student.username.toString())
// // );


//   // Bu sınıflara bağlı öğrenci profillerini bulun
//   const studentClassRelations = await this.userCrRepository
//     .createQueryBuilder('user_cr')
//     .leftJoinAndSelect('user_cr.user', 'user')
//     .where('user_cr.classroomId IN (:...classroomIds)', { classroomIds: classrooms.map(c => c.id) })
//     .andWhere('user.roles = :role', { role: Role.Student })
//     .getMany();

//   console.log('All Students in Classrooms:', studentClassRelations);

//   // `studentClassRelations` içinde olup `studentsWithProfiles` içinde bulunmayan öğrencileri bulun
//   const studentIdsInClassrooms = studentClassRelations.map(userCr => userCr.user.id);

//     const incompleteProfiles = studentsWithoutProfiles.filter(profile =>
//       !studentIdsInClassrooms.includes(profile.username.id)
//     );   

//   const completedProfiles = studentsWithProfiles.filter(profile =>
//     studentIdsInClassrooms.includes(profile.username.id)
//   );

//   console.log('Completed Profiles:', completedProfiles);
//   console.log('Incomplete Profiles:', incompleteProfiles);

//   return {
//     completedProfiles,
//     incompleteProfiles,
//     message: incompleteProfiles.length > 0 
//     ? 'There are users with incomplete profiles.'
//     : 'All profiles are complete.' 
//   };
// }

// async findAllStudents(accessToken: string): Promise<{ completedProfiles: ProfileEntity[], incompleteProfiles: ProfileEntity[], message: string }> {
//   // Token'ı çözümleyerek kullanıcı ID'sini alın
//   const decodedToken: any = this.jwtService.decode(accessToken);
//   const userId = decodedToken.sub;

//   if (!userId) {
//     throw new InternalServerErrorException('Invalid token or user ID not found.');
//   }

//   // Kullanıcının oluşturduğu sınıfları bulun
//   const classrooms = await this.classroomRepository
//     .createQueryBuilder('classroom')
//     .where('classroom.creatorId = :userId', { userId })
//     .getMany();

//   if (classrooms.length === 0) {
//     throw new InternalServerErrorException('No classrooms found for this user.');
//   }

//   // Sınıfların ID'lerini alın
//   const classroomIds = classrooms.map(classroom => classroom.id);

//   // Öğrencileri ve profillerini getirin
//   const profiles = await this.profileRepository
//     .createQueryBuilder('profile')
//     .leftJoinAndSelect('profile.username', 'user')
//     .where('user.roles = :role', { role: Role.Student })
//     .getMany();

//   console.log('Profiles:', profiles);

//   // Öğrencilerin sınıflarını kontrol etmek için doğru özelliği kullanın
//   const studentProfiles = profiles.filter(profile =>
//     profile.username.classrooms?.some(classroom => classroomIds.includes(classroom.id)) // Güvenli erişim
//   );

//   // Eksik profiller için bir dizi oluştur
//   const incompleteProfiles: ProfileEntity[] = [];

//   // Kullanıcılar arasında eksik profilleri belirle
//   studentProfiles.forEach(profile => {
//     // Eksik olan profilleri kontrol edin
//     if (!profile.name || !profile.surname || !profile.dateOfBirth || !profile.gender) {
//       incompleteProfiles.push({
//         id: profile.id ?? null,
//         name: profile.name ?? '',
//         surname: profile.surname ?? '',
//         dateOfBirth: profile.dateOfBirth ? new Date(profile.dateOfBirth) : new Date(), // Varsayılan tarih
//         gender: profile.gender ?? '',
//         username: profile.username, // Kullanıcı nesnesini doğrudan kullanın
//         residence: profile.residence ?? '', // Eksik olan diğer özellikler
//         phone: profile.phone ?? '', // Varsayılan değerler ekleyin
//         email: profile.email ?? '',
//         roles: profile.username.roles // Kullanıcı rolünü kullanın
//       } as ProfileEntity); // ProfileEntity türüne dönüştür
//     }
//   });

//   // Tamamlanmış profilleri oluştur
//   const completedProfiles = studentProfiles.filter(profile =>
//     profile.name && profile.surname && profile.dateOfBirth && profile.gender
//   );

//   console.log('Completed Profiles:', completedProfiles); // Debug log
//   console.log('Incomplete Profiles:', incompleteProfiles); // Debug log

//   // Sonuçları döndür
//   return {
//     completedProfiles,
//     incompleteProfiles,
//     message: incompleteProfiles.length > 0 
//       ? 'There are students with incomplete profiles.'
//       : 'All student profiles are complete.' 
//   };
// }



 //çalışan






/*
async findAllStudents(accessToken: string): Promise<{ completedProfiles: ProfileEntity[], incompleteProfiles: ProfileEntity[], message: string }> {
  // Token'ı çözümleyerek kullanıcı ID'sini alın
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

  // Sınıflara bağlı olan kullanıcıları bulun
  const classroomIds = classrooms.map(classroom => classroom.id);
  
  const usersInClassrooms = await this.userRepository
    .createQueryBuilder('user')
    .innerJoinAndSelect('user.classrooms', 'classroom')
    .where('classroom.id IN (:...classroomIds)', { classroomIds })
    .andWhere('user.roles = :role', { role: Role.Student })
    .getMany();

  console.log('Users In Classrooms:', usersInClassrooms);

  // Kullanıcıların profillerini bulun
  const profiles = await this.profileRepository
    .createQueryBuilder('profile')
    .leftJoinAndSelect('profile.username', 'user')
    .where('user.id IN (:...userIds)', { userIds: usersInClassrooms.map(user => user.id) })
    .getMany();

  console.log('Profiles:', profiles);

  // Eksik profiller için bir dizi oluştur
  const incompleteProfiles: ProfileEntity[] = [];

  // Kullanıcılar arasında eksik profilleri belirle
  usersInClassrooms.forEach(user => {
    const profile = profiles.find(profile => profile.username.id === user.id);

    if (!profile || !profile.name || !profile.surname || !profile.dateOfBirth || !profile.gender) {
      incompleteProfiles.push({
        id: profile?.id ?? null,
        name: profile?.name ?? '',
        surname: profile?.surname ?? '',
        dateOfBirth: profile?.dateOfBirth,//? new Date(profile.dateOfBirth) : new Date(), // Varsayılan tarih
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
      ? 'There are students with incomplete profiles.'
      : 'All student profiles are complete.' 
  };
}
*/


/*
async findAllStudents(accessToken: string): Promise<UsersEntity[]> {
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

    console.log('classrooms:', classrooms);
    
  // Sınıflarda kayıtlı olan 'student' rolüne sahip kullanıcıları bul
  const studentClassRelations = await this.userCrRepository
    .createQueryBuilder('user_cr')
    .leftJoinAndSelect('user_cr.user', 'user')
    .where('user_cr.classroomId IN (:...classroomIds)', { classroomIds: classrooms.map(c => c.id) })
    .andWhere('user.roles = :role', { role: Role.Student })
    .getMany();

    console.log('studentClassRelations:', studentClassRelations);
      // Kullanıcıları öğrenci rollerine göre al
  const users = await this.userRepository.find({
    where: { roles: Role.Student },
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
        dateOfBirth: profile?.dateOfBirth,//? new Date(profile.dateOfBirth) : new Date(), // Varsayılan tarih
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
      ? 'There are students with incomplete profiles.'
      : 'All student profiles are complete.' 
  };
}
    

//   // 'user' ilişkisini kullanarak öğrenci ID'lerini al
//   const studentIds = studentClassRelations.map(relation => relation.user.id);

//   const students = await this.userRepository
//     .createQueryBuilder('user')
//     .where('user.id IN (:...studentIds)', { studentIds })
//     .getMany();

//   return students;
// }

*/


/*
async findAllStudents(accessToken: string): Promise<any> {
  const decodedToken: any = this.jwtService.decode(accessToken);
  const userId = decodedToken.sub;

  if (!userId || isNaN(Number(userId))) {
    throw new InternalServerErrorException('Invalid token or user ID not found.');
  }

  try {
    // Find classrooms created by the user
    const classrooms = await this.classroomRepository
      .createQueryBuilder('classroom')
      .where('classroom.creatorId = :userId', { userId: Number(userId) })
      .getMany();

    if (classrooms.length === 0) {
      throw new InternalServerErrorException('No classrooms found for this user.');
    }

    console.log('classrooms:', classrooms);

    // Find users with 'student' role in these classrooms
    const studentClassRelations = await this.userCrRepository
      .createQueryBuilder('user_cr')
      .leftJoinAndSelect('user_cr.user', 'user')
      .where('user_cr.classroomId IN (:...classroomIds)', { classroomIds: classrooms.map(c => c.id) })
      .andWhere('user.roles = :role', { role: Role.Student })
      .getMany();

    console.log('studentClassRelations:', studentClassRelations);

    // Get users with 'student' role
    const users = await this.userRepository.find({
      where: { roles: Role.Student },
    });

    console.log('Users:', users);

    // Extract IDs of students
    const studentIds = users.map(user => user.id);

    // Get profiles based on user IDs
    const profiles = await this.profileRepository.find({
      where: { username: In(studentIds) } // Ensure `usernameId` is correct
    });

    // Create an array for incomplete profiles
    const incompleteProfiles: ProfileEntity[] = [];

    // Identify incomplete profiles
    users.forEach(user => {
      const profile = profiles.find(profile => profile.username.username === user.username);

      if (!profile || !profile.name || !profile.surname || !profile.dateOfBirth || !profile.gender) {
        incompleteProfiles.push({
          id: profile?.id ?? null,
          name: profile?.name ?? '',
          surname: profile?.surname ?? '',
          dateOfBirth: profile?.dateOfBirth ?? new Date(), // Default date
          gender: profile?.gender ?? '',
          username: user, // Directly use the user object
          residence: profile?.residence ?? '', // Default values
          phone: profile?.phone ?? '',
          email: profile?.email ?? '',
          roles: profile?.roles ?? ''
        } as ProfileEntity); // Cast to ProfileEntity
      }
    });

    // Create completed profiles
    const completedProfiles = profiles.filter(profile =>
      profile.name && profile.surname && profile.dateOfBirth && profile.gender
    );

    console.log('Completed Profiles:', completedProfiles); // Debug log
    console.log('Incomplete Profiles:', incompleteProfiles); // Debug log

    // Return results
    return {
      completedProfiles,
      incompleteProfiles,
      message: incompleteProfiles.length > 0 
        ? 'There are students with incomplete profiles.'
        : 'All student profiles are complete.' 
    };
  } catch (error) {
    console.error('Error occurred:', error);
    throw new InternalServerErrorException('Failed to find students');
  }
}
son uğraştığım
*/




















 async findAllStudents(accessToken: string): Promise<{ completedProfiles: ProfileEntity[], incompleteProfiles: ProfileEntity[], message: string }> {
  // Token'ı çözümleyerek kullanıcı ID'sini alın
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

  // Sınıflarda olan öğrencilerin profillerini getirin
  const profiles = await this.profileRepository
    .createQueryBuilder('profile')
    .leftJoinAndSelect('profile.username', 'user') // İlişki adı doğru olduğundan emin olun
    .where('user.roles = :role', { role: Role.Student })
    .select(['profile.id', 'profile.name', 'profile.surname', 'profile.dateOfBirth', 'profile.gender', 'user.username'])
    .getMany();

  console.log('All Profiles That Are Students:', profiles);

  // Kullanıcıları öğrenci rollerine göre al
  const users = await this.userRepository.find({
    where: { roles: Role.Student },
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
        dateOfBirth: profile?.dateOfBirth,//? new Date(profile.dateOfBirth) : new Date(), // Varsayılan tarih
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

}
