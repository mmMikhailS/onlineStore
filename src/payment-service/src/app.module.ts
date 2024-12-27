import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AppService } from './app.service';
import { PrismaService } from '../prisma/prisma.service';
import { AppController } from './app.controller';
import { CartRepository } from './repository/cart.repository';
import { UserRepository } from './repository/user.repository';
import { OrderRepository } from './repository/order.repository';
import { ProductRepository } from './repository/product.repository';

@Module({
  providers: [
    PrismaService,
    AppService,
    CartRepository,
    UserRepository,
    AppController,
    OrderRepository,
    ProductRepository,
  ],
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    JwtModule.register({
      secret: process.env.SECRET_KEY,
    }),
  ],
})
export class AppModule {}
