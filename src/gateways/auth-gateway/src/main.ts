import { NestFactory, Reflector } from '@nestjs/core';
import {
  BadRequestException,
  ClassSerializerInterceptor,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { AuthModule } from './auth.module';
import * as dotenv from 'dotenv';
import { HttpExceptionFilter } from './exception/error.exception';
import * as session from 'express-session';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';
import { ValidationError } from 'class-validator';
import { PipeErrorsMapInterface } from './interfaces/pipeErrorsMap.interface';
import { AppLoggerService } from './services/authLogger.service';

dotenv.config();

async function bootstrap(): Promise<void> {
  const app: INestApplication = await NestFactory.create(AuthModule);
  const appLogger: AppLoggerService = app.get(AppLoggerService);

  app.use(
    session({
      secret: process.env.SECRET_KEY,
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: true,
        maxAge: 3600000,
      },
    }),
  );

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
  const config: Omit<OpenAPIObject, 'paths'> = new DocumentBuilder()
    .setTitle('yArzamata')
    .setDescription('yArzamata duo project')
    .setVersion('1.0')
    .build();

  app.enableCors();
  const document: OpenAPIObject = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/swagger', app, document);
  const port: number = +process.env.PORT || 5001;

  await app.listen(port, (): void =>
    appLogger.log(`${port}`, 'BootstrapLogger'),
  );
}

bootstrap();
