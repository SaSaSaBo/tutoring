import { IsString } from "class-validator";

export class SendConnectionDto {

    @IsString()
    pre_message: string;

}