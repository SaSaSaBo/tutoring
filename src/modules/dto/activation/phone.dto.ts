import { IsString } from "class-validator";

export class PhoneActivationDto {

    @IsString()
    phone: string;

    @IsString()
    password: string;

    @IsString()
    password_confirm: string;

}