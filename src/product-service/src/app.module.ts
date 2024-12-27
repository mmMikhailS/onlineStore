import { Module } from '@nestjs/common';
import { ProductRepository } from './repository/product.repository';
import { MulterModule } from '@nestjs/platform-express';
import { AppController } from './app.controller';
import { ProductService } from './app.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [AppController],
  providers: [ProductRepository,  ProductService, PrismaService],
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    JwtModule.register({
      secret: process.env.SECRET_KEY,
    }),
    MulterModule.register({
      dest: './images',
    }),
  ],
})
export class AppModule {}
