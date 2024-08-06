import { IsOptional, IsString } from "class-validator";
import { Place } from "src/modules/enum/place.enum";

export class UpdateProfileDto {

    @IsString()
    username: string;

    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    surname?: string;

    @IsOptional()
    @IsString()
    dateOfBirth?: Date;

    @IsOptional()
    @IsString()
    gender?: string;

    @IsOptional()
    @IsString()
    residence?: string;

    @IsOptional()
    @IsString()
    alma_mater?: string;
    
    @IsOptional()
    @IsString()
    area?: string;

    @IsOptional()
    @IsString()
    explanation?: string;

    @IsOptional()
    @IsString()
    place?: Place;

    @IsOptional()
    @IsString()
    price?: number;

    @IsString()
    password: string;

    @IsString()
    password_confirm: string;

}