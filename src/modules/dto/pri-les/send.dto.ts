import { IsString } from "class-validator";

export class SendPriLesDto {
    
    @IsString()
    pri_les: string;

}