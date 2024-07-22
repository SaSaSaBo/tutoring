import { IsNotEmpty, IsNumber } from "class-validator";

export class AddStudentToClrDto {

    @IsNotEmpty()
    @IsNumber()
    userId: number;

    @IsNotEmpty()
    @IsNumber()
    classroomId: number;

}