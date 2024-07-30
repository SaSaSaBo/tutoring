import { IsString } from "class-validator";

export class EmailActivationDto {

    @IsString()
    email: string;

    @IsString()
    password: string;

    @IsString()
    password_confirm: string;

}