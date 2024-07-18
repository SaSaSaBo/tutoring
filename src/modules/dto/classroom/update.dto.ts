import { IsNumber, IsOptional, IsString } from "class-validator";

export class UpdateCRDto {

    @IsOptional()
    @IsString()
    new_cr_name?: string;

    @IsOptional()
    @IsNumber()
    new_capacity?: number;

}