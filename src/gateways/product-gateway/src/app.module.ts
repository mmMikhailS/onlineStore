import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { AppResponseController } from './kafka/app.response.controller';
import { PrismaService } from '../prisma/prisma.service';
import { isAdminMiddleware } from './middleware/isAdmin.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `.env.${process.env.NODE_ENV}`,
      isGlobal: true,
    }),
  ],
  controllers: [AppController, AppResponseController],
  providers: [AppService, PrismaService, isAdminMiddleware],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(isAdminMiddleware).forRoutes('/products/*');
  }
}
