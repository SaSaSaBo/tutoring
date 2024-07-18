import { IsBoolean, IsOptional, IsString } from "class-validator";

export class DeleteCRDto {

    @IsString()
    cr_name: string

    @IsOptional()
    @IsBoolean()
    softDelete?: boolean
    
}