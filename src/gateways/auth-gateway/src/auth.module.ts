import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { AuthController } from './auth.controller';
// import { GoogleAuthGuard } from './utils/GoogleAuthGuard';
// import { GoogleStrategy } from './utils/GoogleStrategy';
import { AuthMiddleware } from './middleware/auth.middleware';
import { doubleGuardMiddleware } from './middleware/doubleGuard.middleware';
import { UserRepository } from './repository/user.repository';
import { UserGuardRepository } from './repository/userGuard.repository';
import { ActivateRepository } from './repository/activate.repository';
import { TokenService } from './services/token.service';
import { TokenRepository } from './repository/token.repository';
import { ChatRepository } from './repository/chat.repository';
import { PrismaService } from '../prisma/prisma.service';
import { CartRepository } from './repository/cart.repository';
import { LoggerMiddleware } from './middleware/logger.middleware';
import * as winston from 'winston';
import { WinstonModule } from 'nest-winston';
import { AppLoggerService } from './services/authLogger.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `.env.${process.env.NODE_ENV}`,
      isGlobal: true,
    }),
    JwtModule.register({
      secret: process.env.SECRET_KEY,
    }),
    WinstonModule.forRoot({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(
          ({ level, message, timestamp, context }): string => {
            return `[${timestamp}] ${level.toUpperCase()}${context ? ` [${context}]` : ''}: ${message}`;
          },
        ),
      ),
      transports: [
        new winston.transports.Console({
          level: 'debug',
        }),
        new winston.transports.File({
          dirname: 'logs',
          filename: 'application.log',
          level: 'info',
        }),
        new winston.transports.File({
          dirname: 'logs',
          filename: 'errors.log',
          level: 'error',
        }),
      ],
    }),
  ],
  controllers: [AuthController],
  providers: [
    AppLoggerService,
    doubleGuardMiddleware,
    AuthService,
    UserRepository,
    UserGuardRepository,
    ActivateRepository,
    TokenService,
    TokenRepository,
    ChatRepository,
    PrismaService,
    CartRepository,
    LoggerMiddleware,
    // GoogleAuthGuard,
    // GoogleStrategy,
  ],
  exports: [AuthService, WinstonModule],
})
export class AuthModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(AuthMiddleware)
      .exclude('auth/register', 'auth/guard', 'auth/login')
      .forRoutes('*');
    consumer.apply(doubleGuardMiddleware).forRoutes('auth/guard');
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
