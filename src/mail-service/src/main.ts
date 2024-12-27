import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { INestMicroservice, Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';

dotenv.config();

async function bootstrap(): Promise<void> {
  const logger = new Logger();
  const microservice: INestMicroservice =
    await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
      transport: Transport.TCP,
      options: {
        host: process.env.HOST,
        port: 3002,
      },
    });
  await microservice.listen();
  // const app: INestApplication = await NestFactory.create(AppModule);
  // app.useGlobalPipes(
  //   new ValidationPipe({
  //     whitelist: true,
  //     forbidNonWhitelisted: true,
  //     transform: true,
  //     exceptionFactory: (errors: ValidationError[]): BadRequestException => {
  //       return new BadRequestException(
  //         errors.map((error: ValidationError) => ({
  //           property: error.property,
  //           constraints: error.constraints,
  //         })),
  //       );
  //     },
  //   }),
  // );
  //
  // app.useGlobalFilters(new HttpExceptionFilter());
  // app.use(cookieParser());
  //
  // app.enableCors();
  //
  // const port: number = +process.env.PORT || 4002;
  //
  // app.useLogger(logger);
  //
  // await app.listen(port, (): void => logger.log(port));
}

bootstrap();
