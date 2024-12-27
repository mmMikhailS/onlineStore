import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class SortOption {
  @ApiProperty({ description: " it's field" })
  @IsString({ message: 'field is not a string ' })
  field: string;

  @ApiProperty({ description: " it's order" })
  @IsEnum(['asc', 'desc'], { message: "order must be either 'asc' or 'desc' " })
  order: 'asc' | 'desc';
}

export class GetAllProductsDto {
  @ApiProperty({
    description: 'Array of sort options',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type((): typeof SortOption => SortOption)
  sortOptions: SortOption[];
}
