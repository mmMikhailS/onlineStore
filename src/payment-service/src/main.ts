import { NestFactory } from '@nestjs/core';
import {
  BadRequestException,
  INestApplication,
  Logger,
  ValidationPipe,
} from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import { ValidationError } from 'class-validator';
import { PipeErrorsMapInterface } from './interfaces/pipeErrorsMap.interface';

dotenv.config();

async function bootstrap(): Promise<void> {
  const logger = new Logger('Main');

  const app: INestApplication = await NestFactory.create(AppModule);
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
  app.use(cookieParser());
  app.useLogger(logger);

  const port: number = +process.env.PORT || 4003;

  await app.listen(port, (): void => logger.log(port));
}

bootstrap();