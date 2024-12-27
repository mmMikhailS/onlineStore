import { NestFactory, Reflector } from '@nestjs/core';
import {
  BadRequestException,
  ClassSerializerInterceptor,
  INestApplication,
  Logger,
  ValidationPipe,
} from '@nestjs/common';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';
import { PaymentModule } from './payment.module';
import * as dotenv from 'dotenv';
import { HttpExceptionFilter } from './exception/error.exception';
import * as cookieParser from 'cookie-parser';
import { ValidationError } from 'class-validator';
import { PipeErrorsMapInterface } from './interfaces/pipeErrorsMap.interface';

dotenv.config();

async function bootstrap(): Promise<void> {
  const app: INestApplication = await NestFactory.create(PaymentModule, {
    logger: ['error', 'warn', 'log', 'debug'],
  });
  const logger = new Logger('Bootstrap');
  app.useLogger(logger);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: (errors: ValidationError[]): BadRequestException => {
        return new BadRequestException(
          errors.map(
            (error: ValidationError): PipeErrorsMapInterface => ({
              property: error.property,
              constraints: error.constraints,
            }),
          ),
        );
      },
    }),
  );

  app.useGlobalInterceptors(
    new ClassSerializerInterceptor(app.get(Reflector), {
      strategy: 'excludeAll',
      excludeExtraneousValues: true,
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());
  app.use(cookieParser());
  const config: Omit<OpenAPIObject, 'paths'> = new DocumentBuilder()
    .setTitle('yArzamata')
    .setDescription('yArzamata duo project')
    .setVersion('1.0')
    .build();

  app.enableCors();
  const document: OpenAPIObject = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/swagger', app, document);
  const port: number = +process.env.PORT || 5003;

  await app.listen(port, (): void => logger.log(port));
}

bootstrap();
