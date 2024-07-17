import { IsArray, IsEmail, IsEnum, IsOptional, IsPhoneNumber, IsString, MaxLength, MinLength, } from 'class-validator';
import { UsersEntity } from 'src/modules/user/user.entity';
import { Role } from 'src/modules/enum/role.enum';


export class UserRegisterDto{

    @IsString()
    @MinLength(3)
    @MaxLength(50)
    username: string;

    @IsEmail()
    email: string;

    @IsString()
    phone: string;

    @IsOptional()
    @IsArray()
    @IsEnum(Role, { each: true })
    roles?: Role;

    @MinLength(6)
    @MaxLength(10)
    password:string;

    @MinLength(6)
    @MaxLength(10)
    password_confirm:string;
    hashedPassword: string;
   
    toEntity(): UsersEntity {
        const user = new UsersEntity();
        user.username = this.username;
        user.email = this.email;
        user.phone = this.phone;
        user.roles = this.roles;
        user.password = this.hashedPassword;
        return user;
    }

}


  