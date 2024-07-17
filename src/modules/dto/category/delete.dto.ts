import { IsOptional, IsString } from "class-validator";

export class DeleteCategoryDto {
    
    @IsString()
    name: string;

    @IsOptional()
    softDelete?: boolean
    
}