import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { Entity } from 'typeorm';

@Entity()
export class ResetPasswordDto {
  
    @IsString()
    resetToken: string;

    @IsOptional()
    @MinLength(6)
    @MaxLength(10)
    new_password?:string;

}