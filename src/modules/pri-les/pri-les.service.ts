import { Injectable, NotFoundException } from '@nestjs/common';
import { SendPriLesDto } from '../dto/pri-les/send.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { PriLesEntity } from './pri-les.entity';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { UsersEntity } from '../user/user.entity';
import { AcceptPriLesDto } from '../dto/pri-les/accept.dto';

@Injectable()
export class PriLesService {

    constructor(
        @InjectRepository(PriLesEntity) 
        private priLesRepository: Repository<PriLesEntity>,

        @InjectRepository(UsersEntity)
        private usersRepository: Repository<UsersEntity>,


        private jwtService: JwtService,
    ) { }

    async sendPriLes(data: SendPriLesDto, accessToken: string): Promise<{ message: string }> {
        // JWT token'ı decode et
        const decodedToken = this.jwtService.decode(accessToken) as { sub: number };
        const requesterId = decodedToken.sub; // İstek atan kullanıcının ID'si

        // İstek atan kullanıcıyı belirle
        const requester = await this.usersRepository.findOne({ where: { id: requesterId } });
        if (!requester) {
            throw new Error('Requester user not found');
        }

        // PriLesEntity oluştur
        const priLes = this.priLesRepository.create({
            pri_les: data.pri_les,
            requester, // İstek atan kullanıcı
        });

        // PriLesEntity'yi veritabanına kaydet
        await this.priLesRepository.save(priLes);

        return { message: 'Pri-les sent successfully.' };
    }

    async acceptPriLes(data: AcceptPriLesDto, accessToken: string): Promise<{ message: string }> {
        try {
            // JWT token'ı decode et
            const decodedToken = this.jwtService.decode(accessToken) as { sub: number };
            const accepterId = decodedToken.sub; // Kabul eden kullanıcının ID'si
    
            console.log('Accepter ID:', accepterId);
    
            // İstek atan kullanıcıyı belirle
            const requester = await this.usersRepository.findOne({ where: { id: data.requester } });
            if (!requester) {
                throw new NotFoundException('Requester user not found');
            }
    
            console.log('Requester:', requester);
    
            // PriLesEntity'yi bul
            const priLes = await this.priLesRepository.findOne({ where: { id: data.pri_les_id } });
            if (!priLes) {
                throw new NotFoundException('Pri-les request not found');
            }
    
            console.log('PriLes:', priLes);
    
            // PriLesEntity'yi güncelle
            priLes.accepter = await this.usersRepository.findOne({ where: { id: accepterId } }); // Kabul eden kullanıcıyı ayarla
    
            console.log('Updated Accepter ID:', accepterId);
    
            await this.priLesRepository.save(priLes); // Güncellenmiş veriyi kaydet
    
            return { message: 'Pri-les request accepted successfully.' };
        } catch (error) {
            console.error('Error:', error.message); // Hata durumunda konsola yazdırma
            throw error;
        }
    }
    

}
