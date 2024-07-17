import { IsNumber, IsOptional, IsString } from "class-validator"

export class UpdateCategoryDto {

    @IsString()
    name: string

    @IsOptional()
    @IsString()
    new_name?: string;

    @IsOptional()
    @IsString()
    new_definement?: string;

    @IsOptional()
    @IsNumber()
    new_parentId?: number;
    
}