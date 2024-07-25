import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProfileDto } from '../dto/profile/create.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersEntity } from '../user/user.entity';
import { Repository } from 'typeorm';
import { ProfileEntity } from './profile.entity';
import { InOutEntity } from '../in-out/in-out.entity';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class ProfileService {

    constructor(
        @InjectRepository(UsersEntity) 
        private userRepository: Repository<UsersEntity>,

        @InjectRepository(InOutEntity)
        private inOutRepository: Repository<InOutEntity>,

        @InjectRepository(ProfileEntity)
        private profileRepository: Repository<ProfileEntity>,


        private jwtService: JwtService,
    ) {}

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
