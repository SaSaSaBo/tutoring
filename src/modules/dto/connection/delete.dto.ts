import {  IsBoolean, IsOptional } from "class-validator";

export class DeleteConnectionDto{

    @IsOptional()
    @IsBoolean()
    softDelete?: boolean

}