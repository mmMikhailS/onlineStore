import {
  IsArray,
  IsNotEmpty,
  IsObject,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class UnitAmountDto {
  @IsString({ message: 'currency_code должен быть строкой.' })
  @IsNotEmpty({ message: 'currency_code не может быть пустым.' })
  currency_code: string = 'USD';

  @IsString({ message: 'value должен быть строкой.' })
  @IsNotEmpty({ message: 'value не может быть пустым.' })
  value: string;
}

export class ProductDto {
  @IsString({ message: 'name должен быть строкой.' })
  @IsNotEmpty({ message: 'name не может быть пустым.' })
  name: string;

  @IsString({ message: 'description должен быть строкой.' })
  @IsNotEmpty({ message: 'description не может быть пустым.' })
  description: string;

  @IsString({ message: 'quantity должен быть строкой.' })
  @IsNotEmpty({ message: 'quantity не может быть пустым.' })
  quantity: string;

  @IsObject({ message: 'unit_amount должен быть объектом.' })
  @ValidateNested()
  @Type(() => UnitAmountDto)
  unit_amount: UnitAmountDto;
}

export class PaymentProductsDto {
  @IsArray({ message: 'products должен быть массивом.' })
  @ValidateNested({ each: true })
  @Type(() => ProductDto)
  products: [ProductDto];
}
