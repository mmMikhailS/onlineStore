import { applyDecorators } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';

export function CreateOrderResponse() {
  return applyDecorators(
    ApiResponse({
      status: 201,
      description: 'Заказ создан',
    }),
    ApiResponse({
      status: 404,
      description: 'Проблема с payment ключем,  ',
    }),
    ApiResponse({
      status: 400,
      description: 'Проблема с запросом на доступ к payment или на бэкэнд',
    }),
    ApiResponse({
      status: 500,
      description: 'Ошибка в создании  заказа',
    }),
  );
}
