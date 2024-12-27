import {
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsPostalCode,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class AddressDto {
  @IsString({ message: 'addressLine1 must be a string.' })
  @IsNotEmpty({ message: 'addressLine1 cannot be empty.' })
  addressLine1: string;

  @IsString({ message: 'addressLine2 must be a string.' })
  @IsOptional()
  addressLine2?: string;

  @IsString({ message: 'adminArea1 must be a string.' })
  @IsNotEmpty({ message: 'adminArea1 cannot be empty.' })
  adminArea1: string;

  @IsString({ message: 'adminArea2 must be a string.' })
  @IsNotEmpty({ message: 'adminArea2 cannot be empty.' })
  adminArea2: string;

  @IsString({ message: 'postalCode must be a string.' })
  @IsPostalCode('UA', {
    message: 'postalCode must match the postal code format for Ukraine.',
  })
  postalCode: string;

  @IsString({ message: 'countryCode must be a string.' })
  @IsNotEmpty({ message: 'countryCode cannot be empty.' })
  countryCode: string;
}

class PhoneNumberDto {
  @IsString({ message: 'countryCode must be a string.' })
  @IsNotEmpty({ message: 'countryCode cannot be empty.' })
  countryCode: string;

  @IsString({ message: 'nationalNumber must be a string.' })
  @IsNotEmpty({ message: 'nationalNumber cannot be empty.' })
  nationalNumber: string;
}

class ShippingAddressDto {
  @IsObject({ message: 'address must be an object.' })
  @IsNotEmpty({ message: 'address cannot be empty.' })
  address: AddressDto;

  @IsObject({ message: 'phoneNumber must be an object.' })
  @IsNotEmpty({ message: 'phoneNumber cannot be empty.' })
  phoneNumber: PhoneNumberDto;
}

class UnitAmountDto {
  @IsString({ message: 'currency_code must be a string.' })
  @IsNotEmpty({ message: 'currency_code cannot be empty.' })
  currency_code: string = 'USD';

  @IsString({ message: 'value must be a string.' })
  @IsNotEmpty({ message: 'value cannot be empty.' })
  value: string;
}

export class ProductDto {
  @IsString({ message: 'name must be a string.' })
  @IsNotEmpty({ message: 'name cannot be empty.' })
  name: string;

  @IsString({ message: 'description must be a string.' })
  @IsNotEmpty({ message: 'description cannot be empty.' })
  description: string;

  @IsString({ message: 'quantity must be a string.' })
  @IsNotEmpty({ message: 'quantity cannot be empty.' })
  quantity: string;

  @IsString({ message: 'type must be a string.' })
  @IsNotEmpty({ message: 'type cannot be empty.' })
  type: string;

  @IsObject({ message: 'unit_amount must be an object.' })
  @ValidateNested()
  @Type((): typeof UnitAmountDto => UnitAmountDto)
  unit_amount: UnitAmountDto;
}

export class PaymentProductsDto {
  @IsObject({ message: 'shippingAddress must be an object.' })
  @IsNotEmpty({ message: 'shippingAddress cannot be empty.' })
  @ValidateNested()
  @Type((): typeof ShippingAddressDto => ShippingAddressDto)
  shippingAddress: ShippingAddressDto;

  // @IsArray({ message: 'products must be an array.' })
  // @ValidateNested({ each: true })
  // @Type((): typeof ProductDto => ProductDto)
  // products: ProductDto[];

  @IsNumber({}, { message: 'userId must be a number.' })
  @IsNotEmpty({ message: 'userId cannot be empty.' })
  userId: number;
}
