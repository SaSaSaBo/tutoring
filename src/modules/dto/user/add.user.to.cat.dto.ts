import { ArrayMinSize, ArrayNotEmpty, IsArray, IsInt } from "class-validator";

export class AddUsersToCatsDto {

    @IsInt()
    userId: number;

    @IsArray()
    @ArrayNotEmpty()
    @ArrayMinSize(1)
    @IsInt({ each: true })
    categoryIds: number[];

}