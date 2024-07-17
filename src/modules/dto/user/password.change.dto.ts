import { IsString, MinLength, MaxLength } from 'class-validator';
import { UsersEntity } from '../../user/user.entity';

export class UserPasswordChangeDto {

  @IsString()
  current_password: string;

  @IsString()
  @MinLength(6, { message: 'new_password must be longer than or equal to 6 characters' })
  @MaxLength(10, { message: 'new_password must be shorter than or equal to 10 characters' })
  new_password: string;

  @IsString()
  @MinLength(6, { message: 'password_confirm must be longer than or equal to 6 characters' })
  @MaxLength(10, { message: 'password_confirm must be shorter than or equal to 10 characters)' })
  password_confirm: string;

  toEntity(): UsersEntity {
    const user = new UsersEntity;
     user.password = this.new_password;
    return user;
  }
  
}