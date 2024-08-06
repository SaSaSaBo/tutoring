import { IsEnum, IsString } from 'class-validator';
import { Place } from 'src/modules/enum/place.enum';
export class CreateProfileDto {

    @IsString()
    username: string;

    @IsString()
    name: string;

    @IsString()
    surname: string;

    @IsString()
    dateOfBirth: Date;

    @IsString()
    gender: string;

    @IsString()
    residence: string;
    
}

export class CreateTProfileDto {
    @IsString()
    alma_mater: string;
  
    @IsString()
    area: string;
  
    @IsString()
    explanation: string;
  
    @IsEnum({
        enum: Place
    })
    place: Place;
  
    @IsString()
    price: string;


}
  