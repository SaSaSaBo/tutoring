import { IsNumber, IsString } from "class-validator";
import { ClassroomEntity } from "src/modules/classroom/classroom.entity";
import { FindOperator } from "typeorm";

export class CreateCRDto {

    @IsString()
    cr_name: string;

    @IsNumber()
    capability: number;

    toEntity(): ClassroomEntity {
        const classroom = new ClassroomEntity();
        classroom.cr_name = this.cr_name;
        classroom.capability = this.capability;
        return classroom;
    }
    
}