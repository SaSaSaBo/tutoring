import { IsBoolean, IsOptional } from "class-validator";

export class DeleteMessageDto{

    @IsOptional()
    @IsBoolean()
    softDelete?: boolean
}