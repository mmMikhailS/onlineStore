import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { ResponsePaymentController } from './kafka/app.response.controller';
import { AuthMiddleware } from './middleware/auth.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `.env.${process.env.NODE_ENV}`,
      isGlobal: true,
    }),
    JwtModule.register({
      secret: process.env.SECRET_KEY,
    }),
  ],
  controllers: [PaymentController, ResponsePaymentController],
  providers: [PaymentService, AuthMiddleware],
})
export class PaymentModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(AuthMiddleware).forRoutes('/payment/*');
  }
}
