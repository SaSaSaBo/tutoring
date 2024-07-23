import { IsBoolean } from "class-validator";

export class AcceptConnectionDto {
    
    @IsBoolean()
    accepted: boolean;

}
