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
import { decode } from 'punycode';

@Injectable()
export class ActivationService {

  constructor(
    @InjectRepository(UsersEntity)
    private usersRepository: Repository<UsersEntity>,

    @InjectRepository(ActivationEntity)
    private activationRepository: Repository<ActivationEntity>,

    @InjectRepository(ProfileEntity)
    private profileRepository: Repository<ProfileEntity>,

    private jwtService: JwtService,
    private emailService: EmailService,
    private smsService: SmsService
  ) {}

  async activationEmail(data: EmailActivationDto, accessToken: string): Promise<{message: string}> {
    const decodedToken = this.jwtService.decode(accessToken);
    const usernameToken = decodedToken['username'];

    console.log('Activation Service: Decoded Token:', decodedToken);
    console.log('Activation Service: Username Token:', usernameToken);

    const userId = await this.usersRepository.findOne({ where: {id: decodedToken.sub} });
    console.log('Activation Service: UserId:', userId);
    
    const checkProfile = await this.profileRepository.findOne({ where: {username: userId} });

    console.log('Check Profile DecodedToken.Sub: ', decodedToken.sub);
    

    if(!checkProfile) {
      throw new NotFoundException('User should have a profile!');
    }

    console.log('Check Profile:', checkProfile);
    
  
    const user = await this.usersRepository.findOne({ where: { email: data.email } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    console.log('Activation Service: User:', user);

    if(user.username !== usernameToken) {
      throw new NotFoundException('Something went wrong!');
    }

    // ActivationEntity'de mevcut kaydı kontrol et
    let activation = await this.activationRepository.findOne({ where: { user: user } });
    console.log('Activation Service: Activation:', activation);
    
    const token = Math.random().toString(36).substring(2); // Aktivasyon token'ı oluştur
  
    if (activation) {
      // Mevcut kaydı güncelle
      activation.activationLink = token;
      activation.activationEmailDate = new Date();
    } else {
      // Yeni kayıt oluştur
      activation = this.activationRepository.create({
        user, // userId yerine user kullanılıyor
        activationLink: token,
        activationEmailDate: new Date()
      });
    }
  
    await this.activationRepository.save(activation);
  
    // Aktivasyon e-postasını gönder
    await this.emailService.sendActivationEmail(user.email, token);

    // Eğer hem telefon hem de email aktivasyonu yapıldıysa, activationFlag'ı güncelle
    const phoneActivation = await this.activationRepository.findOne({ where: { user, activationPhoneDate: Not(IsNull()) } });
    const emailActivation = await this.activationRepository.findOne({ where: { user, activationEmailDate: Not(IsNull()) } });
        
    if (emailActivation && phoneActivation) {
      checkProfile.activationFlag = true;
      await this.profileRepository.save(checkProfile);
    }
        
    console.log('ActivationService: activation:', phoneActivation, 'ActivationService: activation:', emailActivation);
        
  
    return { message: 'Activation link sent to your email.' };
  }
  
  async activationPhone(data: PhoneActivationDto, accessToken: string): Promise<{message: string}> {
    const decodedToken = this.jwtService.decode(accessToken);
    const usernameToken = decodedToken['username'];

    console.log('Activation Service: Decoded Token:', decodedToken);
    console.log('Activation Service: Username Token:', usernameToken);

    const userId = await this.usersRepository.findOne({ where: {id: decodedToken.sub} });
    console.log('Activation Service: UserId:', userId);
    
    const checkProfile = await this.profileRepository.findOne({ where: {username: userId} });

    if(!checkProfile) {
      throw new NotFoundException('User should have a profile!');
    }

    console.log('Check Profile:', checkProfile);
    
  
    const user = await this.usersRepository.findOne({ where: { phone: data.phone } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    console.log('Activation Service: User:', user);

    if(user.username !== usernameToken) {
      throw new NotFoundException('Something went wrong!');
    }

    // ActivationEntity'de mevcut kaydı kontrol et
    let activation = await this.activationRepository.findOne({ where: { user } });
    const code = Math.floor(100000 + Math.random() * 900000).toString(); // Aktivasyon kodu oluştur
  
    if (activation) {
      // Mevcut kaydı güncelle
      activation.activationCode = code;
      activation.activationPhoneDate = new Date();
    } else {
      // Yeni kayıt oluştur
      activation = this.activationRepository.create({
        user, // userId yerine user kullanılıyor
        activationCode: code,
        activationPhoneDate: new Date()
      });
    }
  
    await this.activationRepository.save(activation);
  
    // SMS'i gönder
    await this.smsService.sendActivationCode(user.phone, code);

    // Eğer hem telefon hem de email aktivasyonu yapıldıysa, activationFlag'ı güncelle
    const phoneActivation = await this.activationRepository.findOne({ where: { user, activationPhoneDate: Not(IsNull()) } });
    const emailActivation = await this.activationRepository.findOne({ where: { user, activationEmailDate: Not(IsNull()) } });

    if (emailActivation && phoneActivation) {
      checkProfile.activationFlag = true;
      await this.profileRepository.save(checkProfile);
    }

    console.log('ActivationService: activation:', phoneActivation, 'ActivationService: activation:', emailActivation);

  
    return { message: 'Activation code sent to your phone.' };
  }

}