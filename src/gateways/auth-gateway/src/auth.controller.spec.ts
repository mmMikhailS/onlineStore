import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { RegisterResponseDto } from './dto/responseDto/register.response.dto';
import { LoginResponseDto } from './dto/responseDto/login.response.dto';
import { LoginGuardResponseDto } from './dto/responseDto/loginGuard.response.dto';
import { ChangePasswordResponseDto } from './dto/responseDto/changePassword.response.dto';
import { AppLoggerService } from './services/authLogger.service';
import * as winston from 'winston';
import { WinstonModule } from 'nest-winston';

describe('AuthGatewayController', (): void => {
  let controller: AuthController;
  let service: AuthService;

  const res: any = {};
  res.cookie = jest.fn().mockReturnValue(res);
  res.header = jest.fn().mockReturnValue(res);

  const testUser = {
    fullName: 'test',
    email: 'test@gmail.com',
    password: '12345678901',
    acceptPassword: '12345678901',
  };

  beforeEach(async (): Promise<void> => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      imports: [
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
      providers: [
        JwtService,
        AppLoggerService,
        {
          provide: AuthService,
          useValue: {
            REFRESH_TOKEN_HEADER_NAME: 'refresh-token',
            register: jest.fn(),
            login: jest.fn(),
            changePassword: jest.fn(),
            refresh: jest.fn(),
            logout: jest.fn(),
            addRefreshTokenToResponse: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
  });

  describe('registration', (): void => {
    it('should return registered user', async (): Promise<void> => {
      const password = `${Math.round(Math.random() * 10000)}${Math.round(Math.random() * 10000)}`;
      const reqData = {
        fullName: 'test',
        email: `test99999999999999999999999999999999999999999@gmail.com`,
        password,
        acceptPassword: password,
      };

      service.register = jest.fn().mockResolvedValue({
        id: 1,
        isActivated: false,
        activationLink: 'http://example.com/activate/123',
        tokens: {
          refreshToken: 'sampleRefreshToken',
          accessToken: 'sampleAccessToken',
        },
      });

      const response: RegisterResponseDto = await controller.register(
        reqData,
        res,
      );
      expect(service.register).toHaveBeenCalledWith(reqData);
      expect(response).toEqual({
        id: 1,
        isActivated: false,
        activationLink: 'http://example.com/activate/123',
        tokens: {
          refreshToken: 'sampleRefreshToken',
          accessToken: 'sampleAccessToken',
        },
      });
    });

    it('should return error for already registered user', async (): Promise<void> => {
      const reqData = { ...testUser };
      service.register = jest.fn().mockResolvedValue({
        errorMessage: 'User already registered at this email',
      });

      const response: RegisterResponseDto = await controller.register(
        reqData,
        res,
      );
      expect(service.register).toHaveBeenCalledWith(reqData);
      expect(response).toEqual({
        errorMessage: 'User already registered at this email',
      });
    });

    it('should return error for mismatched passwords', async (): Promise<void> => {
      const reqData = {
        fullName: 'test',
        email: 'test@gmail.com',
        password: 'password1',
        acceptPassword: 'password2',
      };
      service.register = jest
        .fn()
        .mockResolvedValue({ errorMessage: 'Passwords do not match' });

      const response: RegisterResponseDto = await controller.register(
        reqData,
        res,
      );
      expect(service.register).toHaveBeenCalledWith(reqData);
      expect(response).toEqual({
        errorMessage: 'Passwords do not match',
      });
    });
  });

  describe('login', (): void => {
    it('should return signed-in user', async (): Promise<void> => {
      const reqData = {
        email: testUser.email,
        password: testUser.password,
      };
      service.login = jest.fn().mockResolvedValue({
        id: 1,
        isActivated: true,
        tokens: {
          refreshToken: 'refreshToken123',
          accessToken: 'accessToken123',
        },
      });

      const response: LoginResponseDto | LoginGuardResponseDto =
        await controller.login(res, reqData);
      expect(service.login).toHaveBeenCalledWith(reqData);
      expect(response).toEqual({
        id: 1,
        isActivated: true,
        tokens: {
          refreshToken: 'refreshToken123',
          accessToken: 'accessToken123',
        },
      });
    });

    it('should return error for unregistered user', async (): Promise<void> => {
      const reqData = {
        email: 'unknown@gmail.com',
        password: '12345',
      };
      service.login = jest
        .fn()
        .mockResolvedValue({ errorMessage: 'User not registered' });

      const response: LoginResponseDto | LoginGuardResponseDto =
        await controller.login(res, reqData);
      expect(service.login).toHaveBeenCalledWith(reqData);
      expect(response).toEqual({
        errorMessage: 'User not registered',
      });
    });

    it('should return error for invalid password', async (): Promise<void> => {
      const reqData = {
        email: testUser.email,
        password: 'wrongpassword',
      };
      service.login = jest
        .fn()
        .mockResolvedValue({ errorMessage: 'Invalid password' });

      const response: LoginResponseDto | LoginGuardResponseDto =
        await controller.login(res, reqData);
      expect(service.login).toHaveBeenCalledWith(reqData);
      expect(response).toEqual({
        errorMessage: 'Invalid password',
      });
    });
  });

  describe('change password', (): void => {
    it('should return changed password confirmation', async (): Promise<void> => {
      const reqData = {
        email: testUser.email,
        oldPassword: testUser.password,
        newPassword: 'newpassword123',
        acceptNewPassword: 'newpassword123',
      };

      // service.changePassword = jest.fn().mockResolvedValue();
      //
      // const response: ChangePasswordResponseDto =
      //   await controller.changePassword(reqData);
      // expect(service.changePassword).toHaveBeenCalledWith(reqData);
      // expect(response).toEqual();
    });

    it('should return error for mismatched new passwords', async (): Promise<void> => {
      const reqData = {
        email: testUser.email,
        oldPassword: testUser.password,
        newPassword: 'newpassword123',
        acceptNewPassword: 'differentpassword123',
      };

      service.changePassword = jest
        .fn()
        .mockResolvedValue({ errorMessage: 'Passwords do not match' });

      const response: ChangePasswordResponseDto =
        await controller.changePassword(reqData);
      expect(service.changePassword).toHaveBeenCalledWith(reqData);
      expect(response).toEqual({
        errorMessage: 'Passwords do not match',
      });
    });

    it('should return error for old password mismatch', async (): Promise<void> => {
      const reqData = {
        email: testUser.email,
        oldPassword: 'wrongpassword',
        newPassword: 'newpassword123',
        acceptNewPassword: 'newpassword123',
      };

      service.changePassword = jest
        .fn()
        .mockResolvedValue({ errorMessage: 'Old password is incorrect' });

      const response: ChangePasswordResponseDto =
        await controller.changePassword(reqData);
      expect(service.changePassword).toHaveBeenCalledWith(reqData);
      expect(response).toEqual({
        errorMessage: 'Old password is incorrect',
      });
    });
  });
});
