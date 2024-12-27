import { applyDecorators } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';

export function DeleteProductResponse() {
  return applyDecorators(
    ApiResponse({
      status: 204,
      description: 'Продукт успешно удален',
    }),
  );
}
