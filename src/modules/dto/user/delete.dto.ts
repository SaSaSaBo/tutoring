import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UsersDeleteDto {

  @IsNotEmpty()
  @IsString()
  username: string;
  
  @IsOptional()
  @IsBoolean()
  softDelete?: boolean;
  
}