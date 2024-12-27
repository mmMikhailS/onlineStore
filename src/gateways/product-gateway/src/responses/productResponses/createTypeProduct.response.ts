import { applyDecorators } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';

export function CreateTypeProductResponse() {
  return applyDecorators(
    ApiResponse({
      status: 201,
      description: 'Тип успешно создан',
    }),
  );
}
