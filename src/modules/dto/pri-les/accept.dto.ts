import { IsInt, IsNotEmpty } from 'class-validator';

export class AcceptPriLesDto {
    @IsInt()
    @IsNotEmpty()
    requester: number; // İstek atan kullanıcının ID'si

    @IsInt()
    @IsNotEmpty()
    pri_les_id: number; // Kabul edilen pri-les isteğinin ID'si
}
