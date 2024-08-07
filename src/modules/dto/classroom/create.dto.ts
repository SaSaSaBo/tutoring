import { IsNumber, IsOptional, IsString } from "class-validator";
import { ClassroomEntity } from "src/modules/classroom/classroom.entity";

export class CreateCRDto {

    @IsString()
    cr_name: string;

    @IsNumber()
    capability: number;

    @IsNumber()
    categoryId: number; // Change to number type

    @IsString()
    price: string;

    toEntity(): ClassroomEntity {
        const classroom = new ClassroomEntity();
        classroom.cr_name = this.cr_name;
        classroom.capability = this.capability;
        return classroom;
    }
}
