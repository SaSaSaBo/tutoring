import { IsOptional, IsString } from "class-validator";

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

    @IsString()
    password: string;

    @IsString()
    password_confirm: string;

}