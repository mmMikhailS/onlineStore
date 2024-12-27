import { applyDecorators } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';

export function RegisterResponses() {
  return applyDecorators(
    ApiResponse({
      status: 201,
      description: 'Юзер  успешно создан',
    }),
    ApiResponse({
      status: 400,
      description:
        'Пароли не равны или пользователь уже зареган с этим емайлом (может вылететь ошибка регистрации, но шанс нулевой)',
    }),
  );
}
