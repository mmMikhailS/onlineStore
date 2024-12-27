import { applyDecorators } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';

export function PaymentResponse() {
  return applyDecorators(
    ApiResponse({
      status: 400,
      description: ' ошибка запроса ',
    }),
    ApiResponse({
      status: 500,
      description:
        'ошибка создания запроса или ошибка получения аксес токена, если аксес то нужно обновиить пароль ( ошибки на сервере )',
    }),
  );
}
