import { applyDecorators } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';

export function CreateProductResponse() {
  return applyDecorators(
    ApiResponse({
      status: 201,
      description: 'Товар  успешно создан',
    }),
  );
}
