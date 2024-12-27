import { IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ProductFromCartDataDto {
  @ApiProperty({
    description: 'Название продукта',
  })
  @IsString()
  productName: string;

  @ApiProperty({
    description: 'Идентификатор пользователя, связанный с продуктом',
  })
  @IsNumber()
  userId: number;
}
