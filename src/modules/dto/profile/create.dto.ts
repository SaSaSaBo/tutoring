import { IsString } from 'class-validator';
export class CreateProfileDto {

    @IsString()
    username: string;

    @IsString()
    name: string;

    @IsString()
    surname: string;

    @IsString()
    dateOfBirth: Date;

    @IsString()
    gender: string;

    @IsString()
    residence: string;
    
}