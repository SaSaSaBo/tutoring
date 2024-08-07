import { Injectable, NotFoundException } from '@nestjs/common';
import { EmailActivationDto } from '../dto/activation/email.dto';
import { PhoneActivationDto } from '../dto/activation/phone.dto';
import { UsersEntity } from '../user/user.entity';
import { IsNull, Not, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ActivationEntity } from './activation.entity'; // ActivationEntity'i ekle
import { SmsService } from '../service/sms.service';
import { EmailService } from '../service/email.service';
import { JwtService } from '@nestjs/jwt';
import { ProfileEntity } from '../profile/profile.entity';
import { TProfileEntity } from '../profile/tprofile.entity';

@Injectable()
export class ActivationService {

  constructor(
    @InjectRepository(UsersEntity)
    private usersRepository: Repository<UsersEntity>,

    @InjectRepository(ActivationEntity)
    private activationRepository: Repository<ActivationEntity>,

    @InjectRepository(ProfileEntity)
    private profileRepository: Repository<ProfileEntity>,

    @InjectRepository(TProfileEntity)
    private tProfileRepository: Repository<TProfileEntity>,


    private jwtService: JwtService,
    private emailService: EmailService,
    private smsService: SmsService
  ) {}

  async activationEmail(data: EmailActivationDto, accessToken: string): Promise<{ message: string }> {
    const decodedToken = this.jwtService.decode(accessToken);
    const usernameToken = decodedToken['username'];
    const userId = decodedToken.sub;
  
    console.log('Activation Service: Decoded Token:', decodedToken);
    console.log('Activation Service: Username Token:', usernameToken);
  
    // Kullanıcıyı ID ile bul
    const user = await this.usersRepository.findOne({
      where: { id: userId },
    });
  
    if (!user) {
      throw new NotFoundException('User not found');
    }
    
    console.log('Activation Service: User:', user);
  
    let checkProfile;

    if (decodedToken.role.includes('student')) {
      const user = await this.usersRepository.findOne({ where: { id: userId } });
      // Öğrenci profili ID ile bulunmalı
      checkProfile = await this.profileRepository.findOne({
        where: { username: user },
      });
  
      if (!checkProfile) {
        console.log(`Activation Service: Profile not found for student with ID: ${userId}`);
        // Log profile table data for debugging
        const profiles = await this.profileRepository.find();
        console.log('Activation Service: All profiles:', profiles);
      }
  
    } else {
      const user = await this.usersRepository.findOne({ where: { id: userId } });
      // Öğretmen profili ID ile bulunmalı
      checkProfile = await this.tProfileRepository.findOne({
        where: { username: user },
      });
  
      if (!checkProfile) {
        console.log(`Activation Service: Profile not found for teacher with ID: ${userId}`);
        throw new NotFoundException('User should have a profile!');
      }
    }
  
    console.log('Activation Service: 1st checkProfile:', checkProfile);
  
    // Profilin bulunup bulunmadığını kontrol et
    if (!checkProfile) {
      throw new NotFoundException('Profile not found!');
    }

    const userByEmail = await this.usersRepository.findOne({
      where: { email: data.email },
    });
  
    if (!userByEmail) {
      throw new NotFoundException('User not found');
    }
  
    if (userByEmail.username !== usernameToken) {
      throw new NotFoundException('Something went wrong!');
    }
  
    let activation = await this.activationRepository.findOne({
      where: { user: { id: userByEmail.id } },
    });
  
    const token = Math.random().toString(36).substring(2); // Aktivasyon token'ı oluştur
  
    if (activation) {
      // Mevcut kaydı güncelle
      activation.activationLink = token;
      activation.activationEmailDate = new Date();
    } else {
      // Yeni kayıt oluştur
      activation = this.activationRepository.create({
        user: userByEmail,
        activationLink: token,
        activationEmailDate: new Date(),
      });
    }
  
    await this.activationRepository.save(activation);
  
    // Aktivasyon e-postasını gönder
    await this.emailService.sendActivationEmail(userByEmail.email, token);
  
    // Eğer hem telefon hem de email aktivasyonu yapıldıysa, activationFlag'ı güncelle
    const phoneActivation = await this.activationRepository.findOne({
      where: {
        user: { id: userByEmail.id },
        activationPhoneDate: Not(IsNull()),
      },
    });
  
    const emailActivation = await this.activationRepository.findOne({
      where: {
        user: { id: userByEmail.id },
        activationEmailDate: Not(IsNull()),
      },
    });
  
    if (emailActivation && phoneActivation) {
      checkProfile.activationFlag = true;
      if (decodedToken.role.includes('student')) {
        await this.profileRepository.save(checkProfile);
      } else {
        await this.tProfileRepository.save(checkProfile);
      }
    }
  
    console.log('ActivationService: phoneActivation:', phoneActivation, 'ActivationService: emailActivation:', emailActivation);
  
    return { message: 'Activation link sent to your email.' };
  }
  
  async activationPhone(data: PhoneActivationDto, accessToken: string): Promise<{ message: string }> {
    const decodedToken = this.jwtService.decode(accessToken);
    const usernameToken = decodedToken['username'];
    const userId = decodedToken.sub;
  
    console.log('Activation Service: Decoded Token:', decodedToken);
    console.log('Activation Service: Username Token:', usernameToken);
    
    // Kullanıcıyı ID ile bul
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    console.log('Activation Service: User:', user);
    
    if (!user) {
      throw new NotFoundException('User not found');
    }
    
    // Kullanıcı rolünü kontrol et
    const userRole = decodedToken.role;
    console.log('Activation Service: User Role:', userRole);
    
    let checkProfile;
    if (userRole.includes('student')) {
      console.log('Activation Service: Checking student profile');
      const user = await this.usersRepository.findOne({ where: { id: userId } });
      // Öğrenci profili ID ile bulunmalı
      checkProfile = await this.profileRepository.findOne({ where: { username: user } });
      console.log('Activation Service: Student Profile:', checkProfile);
      
      if (!checkProfile) {
        console.log('Activation Service: Profile not found for student with ID:', userId);
        const profiles = await this.profileRepository.find();
        console.log('Activation Service: All profiles:', profiles);
      }
    } else {
      console.log('Activation Service: Checking teacher profile');
      // Öğretmen profili ID ile bulunmalı
      const user = await this.usersRepository.findOne({ where: { id: userId } });
      checkProfile = await this.tProfileRepository.findOne({ where: { username: user } });
      console.log('Activation Service: Teacher Profile:', checkProfile);
      
      if (!checkProfile) {
        console.log('Activation Service: Profile not found for teacher with ID:', userId);
        throw new NotFoundException('User should have a profile!');
      }
    }
    
    if (!checkProfile) {
      throw new NotFoundException('Profile not found!');
    }    
      
    console.log('Activation Service: 1st checkProfile:', checkProfile);
  
    const userByPhone = await this.usersRepository.findOne({
      where: { phone: data.phone },
    });
  
    if (!userByPhone) {
      throw new NotFoundException('User not found');
    }
  
    console.log('Activation Service: User:', userByPhone);
  
    if (userByPhone.username !== usernameToken) {
      throw new NotFoundException('Something went wrong!');
    }
  
    let activation = await this.activationRepository.findOne({
      where: { user: { id: userByPhone.id } },
    });
  
    const code = Math.floor(100000 + Math.random() * 900000).toString(); // Aktivasyon kodu oluştur
  
    if (activation) {
      // Mevcut kaydı güncelle
      activation.activationCode = code;
      activation.activationPhoneDate = new Date();
    } else {
      // Yeni kayıt oluştur
      activation = this.activationRepository.create({
        user: userByPhone,
        activationCode: code,
        activationPhoneDate: new Date(),
      });
    }
  
    await this.activationRepository.save(activation);
  
    // SMS'i gönder
    await this.smsService.sendActivationCode(userByPhone.phone, code);
  
    // Eğer hem telefon hem de email aktivasyonu yapıldıysa, activationFlag'ı güncelle
    const phoneActivation = await this.activationRepository.findOne({
      where: {
        user: { id: userByPhone.id },
        activationPhoneDate: Not(IsNull()),
      },
    });
  
    const emailActivation = await this.activationRepository.findOne({
      where: {
        user: { id: userByPhone.id },
        activationEmailDate: Not(IsNull()),
      },
    });
  
    if (emailActivation && phoneActivation) {
      checkProfile.activationFlag = true;
      if (decodedToken.role.includes('student')) {
        await this.profileRepository.save(checkProfile);
      } else {
        await this.tProfileRepository.save(checkProfile);
      }
    }
  
    console.log('ActivationService: phoneActivation:', phoneActivation, 'ActivationService: emailActivation:', emailActivation);
    console.log('ActivationService: Last checkProfile:', checkProfile);
    
    return { message: 'Activation code sent to your phone.' };
  }

}