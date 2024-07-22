import { IsNotEmpty, IsNumber } from "class-validator";

export class AddStudentToClrDto {

    @IsNotEmpty()
    @IsNumber()
    studentId: number;

    @IsNotEmpty()
    @IsNumber()
    classroomId: number;

}