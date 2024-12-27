import { applyDecorators } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';

export function DeleteProductTypeResponse() {
  return applyDecorators(
    ApiResponse({
      status: 204,
      description: 'Тип успешно удален',
    }),
  );
}
