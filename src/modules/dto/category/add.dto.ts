import { Type } from 'class-transformer';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';
import { CategoryEntity } from 'src/modules/category/category.entity';

export class AddCategoryDto {
  @IsString()
  name: string;

  @IsString()
  definement: string;

  @IsOptional()
  @IsBoolean()
  status?: boolean;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  parentId?: number;

  toEntity(): CategoryEntity {
    const category = new CategoryEntity();
    category.name = this.name;
    category.definement = this.definement;
    category.status = this.status;
    return category;
  }
}
