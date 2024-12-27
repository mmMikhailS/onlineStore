import { applyDecorators } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';

export function CreateProductTypeResponse() {
  return applyDecorators(
    ApiResponse({
      status: 201,
      description: 'Тип успешно создан',
    }),
  );
}
