import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class BlockDto {
  
  @IsNumber()
  @Type(()=> Number)
  blockedUserId: number;
  
}
