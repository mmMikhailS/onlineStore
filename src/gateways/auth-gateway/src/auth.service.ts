import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  OnModuleDestroy,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
import { Response } from 'express';
import * as argon2id from 'argon2';
import * as uuid from 'uuid';
import { UserRepository } from './repository/user.repository';
import { ActivateRepository } from './repository/activate.repository';
import { TokenService } from './services/token.service';
import { TokenRepository } from './repository/token.repository';
import { kafka } from './utils/kafka';
import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';
import { UserGuardRepository } from './repository/userGuard.repository';
import * as crypto from 'crypto';
import { registrationUserDto } from './dto/registrationUserDto.dto';
import { ChatRepository } from './repository/chat.repository';
import { loginDto } from './dto/login.dto';
import { changePassDto } from './dto/changePass.dto';
import { activateAccountDto } from './dto/activateAccount.dto';
import { VerifyDto } from './dto/verify.dto';
import { LoginResponseDto } from './dto/responseDto/login.response.dto';
import { LogoutResponseDto } from './dto/responseDto/logout.response.dto';
import { GuardResponseDto } from './dto/responseDto/guard.response.dto';
import { DeleteAccountResponseDto } from './dto/responseDto/deleteAccount.response.dto';
import { ChangePasswordResponseDto } from './dto/responseDto/changePassword.response.dto';
import { RefreshTokensResponseDto } from './dto/responseDto/refresh.response.dto';
import { ActivateAccountResponseDto } from './dto/responseDto/activateAccount.response.dto';
import { CreateGuardPasswordsResponseDto } from './dto/responseDto/createGuardPasswords.response.dto';
import { GenerateGoogle2faResponseDto } from './dto/responseDto/GenerateGoogle2fa.response.dto';
import { ValidateUserResponseDto } from './dto/responseDto/validateUser.response.dto';
import { UserPasswordInterface } from './interfaces/prisma/UserPassword.interface';
import { TokensInterface } from './interfaces/tokens.interface';
import { UserGuardInterface } from './interfaces/userGuard.interface';
import { ActivateAccountInterface } from './interfaces/activateAccount.interface';
import { GetActivateUserInterface } from './interfaces/prisma/getActivateUser.interface';
import { GoogleSecretInterface } from './interfaces/googleSecret.interface';
import { CartRepository } from './repository/cart.repository';
import { CreateUserInterface } from './interfaces/prisma/createUser.interface';
import { FindUserIdByEmailInterface } from './interfaces/prisma/findUserIdByEmail.interface';
import { FindUserByTokenInterface } from './interfaces/prisma/findUserByToken.interface';
import { PayloadInterface } from './interfaces/payload.interface';
import { FindUserChangesByEmailInterface } from './interfaces/prisma/findUserChangesByEmail.interface';
import { FindUserByIdInterface } from './interfaces/findUserById.interface';
import { RegisterResponseDto } from './dto/responseDto/register.response.dto';
import { AppLoggerService } from './services/authLogger.service';
import { GuardAccountServiceDto } from './dto/guardAccountService.dto';
import { CreatingUserInterface } from './interfaces/creatingUser.interface';
import { creatingTokensAndFindingActivationInterface } from './interfaces/creatingTokensAndChekingActivation.interface';
import { UpdateActivateInterface } from './interfaces/prisma/updateActivate.interface';

@Injectable()
export class AuthService implements OnModuleInit, OnModuleDestroy {
  private producer: any;

  private readonly EXPIRE_DAY_REFRESH_TOKEN: number = 1;
  readonly REFRESH_TOKEN_HEADER_NAME: 'authorization' = 'authorization';

  private readonly EXPIRE_MINUTES_GUARD_ACCESS: number = 20;
  readonly GUARD_TOKEN_HEADER_NAME: 'guardaccess' = 'guardaccess';

  constructor(
    private readonly userRepository: UserRepository,
    private readonly userGuardRepository: UserGuardRepository,
    private readonly activateRepository: ActivateRepository,
    private readonly tokenService: TokenService,
    private readonly tokenRepository: TokenRepository,
    private readonly chatRepository: ChatRepository,
    private readonly cartRepository: CartRepository,
    private readonly logger: AppLoggerService,
  ) {
    this.producer = kafka.producer();
  }

  async onModuleInit(): Promise<void> {
    await this.producer.connect();
    this.logger.log('producer connected', 'Kafka');
  }

  async onModuleDestroy(): Promise<void> {
    await this.producer.disconnect();
    this.logger.log('producer disconnected', 'Kafka');
  }

  private encrypt(key: string): string {
    const cipher = crypto.createCipheriv(
      process.env.CRYPTO_ALGORITHM,
      process.env.CRYPTO_SECRET,
      process.env.CRYPTO_IV,
    );

    let encrypted: string = cipher.update(key, 'utf-8', 'hex');
    encrypted += cipher.final('hex');

    return `${encrypted}:${process.env.CRYPTO_IV}`;
  }

  private decrypt(encrypted: string): string {
    const [encryptedString] = encrypted.split(':');
    const decipher = crypto.createDecipheriv(
      process.env.CRYPTO_ALGORITHM,
      process.env.CRYPTO_SECRET,
      process.env.CRYPTO_IV,
    );

    let decrypted: string = decipher.update(encryptedString, 'hex', 'utf-8');
    decrypted += decipher.final('utf-8');

    return decrypted;
  }

  async register(data: registrationUserDto): Promise<RegisterResponseDto> {
    await this.chekingIsUserRegisteredAndPassword(
      data.email,
      data.password,
      data.acceptPassword,
    );

    try {
      const { id, activateLink, activationCode }: CreatingUserInterface =
        await this.creatingUser(data.fullName, data.email, data.acceptPassword);

      const refreshToken: string = await this.creatingTokensAndCartAndGuard(id);

      this.logger.log('Sending message to mail service', 'Register');
      await this.sendKafkaVerificationMail(data.email, activationCode);

      this.logger.log('User registration successful', 'Register');
      return {
        refreshToken,
        fullName: data.fullName,
        email: data.email,
        id,
        activateLink,
        isActivated: false,
      };
    } catch (e) {
      this.logger.error('Registration error', 'Register');
      await this.deleteAllUserLinks(data.email);

      if (e instanceof BadRequestException) {
        throw e;
      }
      throw new InternalServerErrorException('Server error');
    }
  }

  async login(data: loginDto): Promise<LoginResponseDto> {
    this.logger.log('Validating user', 'Login');
    const user: UserPasswordInterface = await this.validateUser(data);

    try {
      this.logger.log('Getting user activation from db', 'Login');
      const activateUser: GetActivateUserInterface =
        await this.activateRepository.findActivateUserById(user.id);

      const { refreshToken, ...twofa }: LoginResponseDto =
        await this.validateUser2fa(user.id, activateUser.isActivated);
      if (refreshToken) {
        return { refreshToken, ...twofa };
      }

      const generatedRefreshToken: string = await this.generateAndSaveTokens(
        user.id,
      );

      await this.sendLoginKafkaMail(data.email);

      this.logger.log('User login completed successfully', 'Login');
      return {
        id: user.id,
        refreshToken: generatedRefreshToken,
        twoStepVerification: false,
        ...(activateUser.isActivated
          ? {
              isActivated: activateUser.isActivated,
            }
          : {
              isActivated: activateUser.isActivated,
              activationLink: activateUser.activationLink,
            }),
      };
    } catch (e) {
      this.logger.error('Login error', 'Login');
      if (
        e instanceof UnauthorizedException ||
        e instanceof BadRequestException
      ) {
        throw e;
      }
      throw new InternalServerErrorException('server error');
    }
  }

  async guard(data: GuardAccountServiceDto): Promise<GuardResponseDto> {
    try {
      const { userId, doubleGuardType, oneTimePass, GoogleCode2fa } = data;
      const email: string = await this.validatingUser(data.userId);

      await this.chekingUser2fa(
        userId,
        doubleGuardType,
        oneTimePass,
        GoogleCode2fa,
      );

      const { refreshToken, isActivated, activationLink } =
        await this.creatingTokensAndFindingActivation(userId);

      await this.sendLoginKafkaMail(email);

      this.logger.log('Guard sompleted successfully', 'Guard');
      return {
        refreshToken,
        id: data.userId,
        ...(isActivated
          ? {
              isActivated: isActivated,
            }
          : {
              isActivated: isActivated,
              activationLink: activationLink,
            }),
      };
    } catch (e) {
      this.logger.error('Guard error', 'Guard');
      if (
        e instanceof UnauthorizedException ||
        e instanceof BadRequestException
      ) {
        throw e;
      }
      throw new InternalServerErrorException('server error');
    }
  }

  async logout(refreshToken: string): Promise<LogoutResponseDto> {
    try {
      const id: number = await this.chekingUserAndVerifyToken(refreshToken);
      this.logger.log("Deleting all user's tokens", 'Guard');
      await this.tokenRepository.clearAllTokens(id);

      this.logger.log('Logout completed successfully', 'Logout');
      return {
        id,
      };
    } catch (e) {
      this.logger.error('Logout eror', 'Logout');
      throw e;
    }
  }

  async deleteAccount(refreshToken: string): Promise<DeleteAccountResponseDto> {
    try {
      this.logger.log('Checking user is already registered', 'DeleteAccount');
      const { userId }: FindUserByTokenInterface =
        await this.tokenRepository.findUserByToken(refreshToken);

      if (!userId) {
        this.logger.error("User isn't registered", 'DeleteAccount');
        throw new UnauthorizedException('User not registered');
      }

      this.logger.log('Cleaning up user-related data', 'DeleteAccount');
      this.tokenRepository.deleteAllTokens(userId);
      this.chatRepository.deleteUserChats(userId);
      this.cartRepository.deleteCart(userId);
      this.activateRepository.deleteById(userId);
      this.userGuardRepository.deleteGuardByUserId(userId);
      const deletedUser: DeleteAccountResponseDto =
        await this.userRepository.deleteUser(userId);

      return deletedUser;
    } catch (e) {
      this.logger.log('delete account error', 'DeleteAccount');
      if (e instanceof UnauthorizedException) {
        throw e;
      }
      throw new InternalServerErrorException('server error');
    }
  }

  async refreshTokens(
    oldRefreshToken: string,
  ): Promise<RefreshTokensResponseDto> {
    const id: number =
      await this.chekingUserAndVerifyRefreshToken(oldRefreshToken);
    try {
      await this.chekingUser(id);

      const refreshToken: string =
        await this.saveGeneratedTokenAndDeleteOldToken(id, oldRefreshToken);

      return {
        id,
        refreshToken,
      };
    } catch (e) {
      this.logger.error('RefreshTokens error', 'RefreshTokens');
      throw e;
    }
  }

  async changePassword(
    data: changePassDto,
  ): Promise<ChangePasswordResponseDto> {
    const { updatedPasswordAt, counter, password } =
      await this.validatingUserChangePassword(data.email);

    try {
      await this.CalculatingIsUserCanChangePassword(updatedPasswordAt, counter);

      await this.validatingPassword(
        data.newPassword,
        data.acceptNewPassword,
        data.oldPassword,
        password,
      );

      const user: ChangePasswordResponseDto =
        await this.hashingAndUpdatingUserPassword(
          data.acceptNewPassword,
          data.email,
        );

      await this.SendKafkaChangePasswordMailAndUpdateCounter(
        data.email,
        user.id,
        counter,
      );

      this.logger.log(
        'Change password completed successfully',
        'ChangePassword',
      );
      return user;
    } catch (e) {
      this.logger.error('Change password error', 'ChangePassword');
      if (
        e instanceof BadRequestException ||
        e instanceof UnauthorizedException
      ) {
        throw e;
      }
      throw new InternalServerErrorException('server error');
    }
  }

  async activateAccount(
    data: activateAccountDto,
  ): Promise<ActivateAccountResponseDto> {
    try {
      const id: number = await this.validateUserActivateAccount(
        data.refreshToken,
      );

      const activationCode: string = await this.validateActivateUser(
        id,
        data.link,
      );

      return await this.verifyCodeAndUpdateUser(id, activationCode, data.code);
    } catch (e) {
      this.logger.error('activate account error', 'ActivateAccount');
      if (
        e instanceof UnauthorizedException ||
        e instanceof BadRequestException
      ) {
        throw e;
      }
      throw new InternalServerErrorException('server error');
    }
  }

  async createGuardPasswords(data: {
    userId: number;
    days: number;
  }): Promise<CreateGuardPasswordsResponseDto> {
    try {
      await this.validateUserCreateUserGuardPasswords(data.userId);
      const passwords = await this.GenerateTenOneTimePasswords(
        data.userId,
        data.days,
      );

      this.logger.log(
        'Create guard passwords completed successfully',
        'CreateGuardPasswords',
      );
      return { passwords };
    } catch (e) {
      if (e instanceof UnauthorizedException) {
        throw e;
      }
      this.logger.error('Create guard passwords error', 'CreateGuardPasswords');
      throw new InternalServerErrorException('server error');
    }
  }

  async generateGoogle2fa(
    userId: number,
  ): Promise<GenerateGoogle2faResponseDto> {
    try {
      const email: string = await this.ValidateUserGenerateGoogle2fa(userId);

      return await this.GenerateSecretAndUpdateUserGuard(email, userId);
    } catch (e) {
      if (
        e instanceof UnauthorizedException ||
        e instanceof BadRequestException
      ) {
        throw e;
      }
      this.logger.error('Generate google 2fa error', 'GenerateGoogle2fa');
      throw new InternalServerErrorException('server error');
    }
  }

  async GoogleValidateUser(data: VerifyDto): Promise<ValidateUserResponseDto> {
    try {
      const userId: number = await this.ValidateUserGoogle2fa(
        data.email,
        data.fullName,
      );
      const refreshToken: string = await this.generateAndUpdateToken(userId);

      await this.chekingUserActivate(userId, data.email);
      await this.sendKafkaGoogleVerificationMail(data.email);

      this.logger.log(
        'Google validate user completed successfully',
        'GoogleValidateUser',
      );
      return {
        refreshToken,
        email: data.email,
        fullName: data.fullName,
      };
    } catch (e) {
      this.logger.error('Google validate user error', 'GoogleValidateUser');
      throw e;
    }
  }

  addGuardTokenToResponse(guardAccess: string, res: Response): void {
    this.logger.log('adding guard token to response', 'Response');
    const expiresIn: Date = new Date();

    expiresIn.setDate(
      expiresIn.getDate() + this.EXPIRE_MINUTES_GUARD_ACCESS * 60 * 1000,
    );

    res.cookie('guardAccess', guardAccess, {
      httpOnly: true,
      expires: expiresIn,
      secure: true,
    });

    console.log(guardAccess);
    res.header(this.GUARD_TOKEN_HEADER_NAME, `${guardAccess}`);
  }

  addRefreshTokenToResponse(refreshToken: string, res: Response): void {
    this.logger.log('adding refresh token to response', 'Response');
    const expiresIn: Date = new Date();

    expiresIn.setDate(
      expiresIn.getDate() + this.EXPIRE_DAY_REFRESH_TOKEN * 24 * 60 * 60 * 1000,
    );

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      expires: expiresIn,
      secure: true,
    });

    console.log(refreshToken);
    res.header(this.REFRESH_TOKEN_HEADER_NAME, `Bearer ${refreshToken}`);
  }

  clearRefreshToken(res: Response): void {
    this.logger.log('clear refresh token', 'Response');
    res.cookie('refreshToken', ' ', {
      httpOnly: true,
      secure: true,
    });

    res.header(this.REFRESH_TOKEN_HEADER_NAME, ' ');
  }

  private async validateUser(data: loginDto): Promise<UserPasswordInterface> {
    const user: UserPasswordInterface =
      await this.userRepository.findUserPasswordByEmail(data.email);
    if (!user) {
      this.logger.log("User isn't registered", 'Login');
      throw new UnauthorizedException("User isn't registered");
    }
    const isEqual: boolean = await argon2id.verify(
      user.password,
      data.password,
    );
    if (!isEqual) {
      this.logger.error('Invalid password', 'Login');
      throw new UnauthorizedException('Invalid password');
    }
    return user;
  }

  private async chekingIsUserRegisteredAndPassword(
    email: string,
    password: string,
    acceptPassword: string,
  ): Promise<void> {
    this.logger.log('Checking if user is already registered', 'Register');
    const candidate: UserPasswordInterface =
      await this.userRepository.findUserPasswordByEmail(email);
    if (candidate) {
      this.logger.error('User already registered', 'Register');
      throw new BadRequestException('User already registered at this email');
    }

    if (password !== acceptPassword) {
      this.logger.warn('Password mismatch during registration', 'Register');
      throw new BadRequestException('Passwords do not match', 'Register');
    }
  }

  private async creatingUser(
    fullName: string,
    email: string,
    acceptPassword: string,
  ): Promise<CreatingUserInterface> {
    this.logger.log(
      'Hashing password and generating activation code',
      'Register',
    );
    const hashPassword: string = await argon2id.hash(acceptPassword);

    const activationCode: string = uuid.v4().replace(/\D/g, '').slice(0, 6);
    const activateLink: string = uuid.v4();

    const hashedActivationCode: string = await argon2id.hash(activationCode);
    this.logger.log('Creating new user record', 'Register');
    const { id }: CreateUserInterface = await this.userRepository.createUser(
      email,
      fullName,
      hashPassword,
    );

    this.logger.log('Creating activation record', 'Register');
    await this.activateRepository.create(
      activateLink,
      hashedActivationCode,
      id,
    );
    return {
      id,
      activateLink,
      activationCode,
    };
  }

  private async creatingTokensAndCartAndGuard(id: number): Promise<string> {
    const { refreshToken }: TokensInterface =
      await this.tokenService.generateTokens(id);
    if (!refreshToken) {
      this.logger.error('Failed to generate refresh token', 'Register');
      throw new InternalServerErrorException('Server error');
    }
    this.logger.log('Saving refresh token', 'Register');
    await this.tokenRepository.create(refreshToken, id);

    this.logger.log('Creating user cart and guard', 'Register');
    await this.cartRepository.createCart(id);
    await this.userGuardRepository.create(id);

    return refreshToken;
  }

  private async deleteAllUserLinks(email: string): Promise<void> {
    const { id }: FindUserIdByEmailInterface =
      await this.userRepository.findUserIdByEmail(email);
    if (!id) {
      throw new InternalServerErrorException('Registration error');
    }

    this.logger.warn('Cleaning up user-related data after failure', 'Register');
    this.tokenRepository.deleteAllTokens(id);
    this.activateRepository.deleteById(id);
    this.userGuardRepository.deleteGuardByUserId(id);
    this.cartRepository.deleteCart(id);
    await this.userRepository.deleteUser(id);
  }

  private async validateUser2fa(
    id: number,
    isActivated: boolean,
  ): Promise<LoginResponseDto> {
    const userGuard: UserGuardInterface =
      await this.userGuardRepository.findUserGuard(id);

    this.logger.log("Checks user's 2fa", 'Login');
    if (userGuard.authApp || userGuard.doubleGuardPass) {
      this.logger.log('Generating guard access token for user', 'Login');
      const guardAccess: string = this.tokenService.createGuardAccessToken(id);

      this.logger.log('Login(guard) completed successfully', 'Login');
      return {
        id: id,
        refreshToken: guardAccess,
        twoStepVerification: true,
        isActivated,
      };
    }
  }

  private async generateAndSaveTokens(id: number): Promise<string> {
    const { refreshToken }: TokensInterface =
      await this.tokenService.generateTokens(id);

    this.logger.log('Saving refresh token for the user', 'Login');
    await this.tokenRepository.create(refreshToken, id);
    return refreshToken;
  }

  private async sendLoginKafkaMail(email: string): Promise<void> {
    this.logger.log(
      'Sending kafka message to mail service for gmail mail',
      'Login',
    );
    await this.producer.send({
      topic: 'login-mail',
      messages: [{ value: JSON.stringify({ to: email }) }],
    });
  }

  private async validatingUser(id: number): Promise<string> {
    this.logger.log('Checking user is already registered', 'Guard');
    const user: FindUserByIdInterface =
      await this.userRepository.findUserById(id);

    if (!user) {
      this.logger.error("User isn't registered", 'Guard');
      throw new BadRequestException('user not registered');
    }

    return user.email;
  }

  private async chekingUser2fa(
    userId: number,
    doubleGuardType: string,
    oneTimePass: string,
    GoogleCode2fa: string,
  ): Promise<void> {
    this.logger.log('Checking if user guard is created', 'Guard');
    const userGuard: UserGuardInterface =
      await this.userGuardRepository.findUserGuard(userId);
    if (!userGuard) {
      this.logger.error("User's security is not enabled", 'Guard');
      throw new BadRequestException('your security is not enabled');
    }

    if (doubleGuardType === 'DoubleGuardPass') {
      this.logger.log("User's option: one-time passwords", 'Guard');

      this.logger.log("Cheking user's one-time passwords", 'Guard');
      let isGuardPassEquals: boolean = false;
      for (let i = 0; i < userGuard.doubleGuardPasswords.length; i++) {
        isGuardPassEquals = await argon2id.verify(
          userGuard.doubleGuardPasswords[i],
          oneTimePass,
        );

        if (isGuardPassEquals) {
          this.logger.debug("Deleting the user's one-time password", 'Guard');

          userGuard.doubleGuardPasswords.splice(i, 1);

          this.logger.log("Updating user's one-time passwords (2fa)", 'Guard');
          await this.userGuardRepository.updateGuardPasswords(
            userGuard.doubleGuardPasswords,
            userId,
          );

          break;
        }
      }

      if (!isGuardPassEquals) {
        this.logger.log('User 2fa password invalid', 'Guard');
        throw new BadRequestException('Guard passwords not equals');
      }
    } else if (doubleGuardType === 'authApp') {
      this.logger.log("User's option: auth app", 'Guard');

      const decryptedSecret2fa: string = this.decrypt(userGuard.secret2fa);

      this.logger.log('verify code', 'Guard');
      const verified: boolean = speakeasy.totp.verify({
        secret: decryptedSecret2fa,
        encoding: 'base32',
        token: GoogleCode2fa,
      });

      if (!verified) {
        this.logger.log('2fa code incorrect', 'Guard');
        throw new BadRequestException('2fa code incorrect');
      }
    }
    this.logger.log('Checking if user guard is created', 'Guard');
  }

  private async creatingTokensAndFindingActivation(
    userId: number,
  ): Promise<creatingTokensAndFindingActivationInterface> {
    this.logger.log("Get user's activate", 'Guard');
    const activateUser: GetActivateUserInterface =
      await this.activateRepository.findActivateUserById(userId);

    const { refreshToken }: TokensInterface =
      await this.tokenService.generateTokens(userId);

    this.logger.log('Saving new refresh token', 'Guard');
    await this.tokenRepository.create(refreshToken, userId);

    return {
      activationLink: activateUser.activationLink,
      isActivated: activateUser.isActivated,
      refreshToken,
    };
  }

  private async chekingUserAndVerifyToken(
    refreshToken: string,
  ): Promise<number> {
    this.logger.log('Checking user is already registered', 'Logout');
    const { id }: PayloadInterface =
      await this.tokenService.verify(refreshToken);

    const user: FindUserByIdInterface =
      await this.userRepository.findUserById(id);

    if (!user) {
      this.logger.error("User isn't registered", 'Logout');
      throw new UnauthorizedException('User not registered');
    }
    return id;
  }

  private async chekingUserAndVerifyRefreshToken(
    oldRefreshToken: string,
  ): Promise<number> {
    this.logger.log('Cheking is user registered', 'RefreshTokens');
    if (!oldRefreshToken) {
      this.logger.error("User isn't registered", 'RefreshTokens');
      throw new UnauthorizedException("User isn't registered");
    }

    this.logger.log('Verify token', 'RefreshTokens');
    const { id }: PayloadInterface =
      await this.tokenService.verify(oldRefreshToken);

    if (!id) {
      this.logger.error("User isn't registered", 'RefreshTokens');
      throw new UnauthorizedException("User isn't registered");
    }
    return id;
  }

  private async saveGeneratedTokenAndDeleteOldToken(
    id: number,
    oldRefreshToken: string,
  ): Promise<string> {
    this.logger.log("Generating and saving user's tokens", 'RefreshTokens');
    const { refreshToken }: TokensInterface =
      await this.tokenService.generateTokens(id);

    await this.tokenRepository.update(refreshToken, id);

    this.logger.log('Deleting old refresh token', 'RefreshTokens');
    await this.tokenRepository.deleteToken(oldRefreshToken);
    return refreshToken;
  }

  private async chekingUser(id: number): Promise<void> {
    this.logger.log('Checking user is already registered', 'RefreshTokens');
    const { email }: FindUserByIdInterface =
      await this.userRepository.findUserById(id);
    if (!email) {
      this.logger.error("User isn't registered", 'RefreshTokens');
      throw new UnauthorizedException("User isn't registered");
    }
  }

  private async validatingUserChangePassword(
    email: string,
  ): Promise<FindUserChangesByEmailInterface> {
    this.logger.log('Validating  user', 'СhangePassword');
    const user: FindUserChangesByEmailInterface =
      await this.userRepository.findUserChangesByEmail(email);

    if (!user) {
      this.logger.error("User isn't registered", 'СhangePassword');
      throw new UnauthorizedException("User isn't registered");
    }

    return user;
  }

  private async CalculatingIsUserCanChangePassword(
    updatedPasswordAt: Date,
    counter: number,
  ): Promise<void> {
    const currentDate: Date = new Date();
    const updatedAtDate: Date = new Date(updatedPasswordAt);
    const diffTime: number = Math.abs(
      currentDate.getTime() - updatedAtDate.getTime(),
    );
    const diffDays: number = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (counter >= 3 && diffDays <= 30) {
      this.logger.error(
        'User has used the maximum password changes in the last 30 days',
        'СhangePassword',
      );
      throw new BadRequestException(
        'User has used the maximum password changes in the last 30 days',
      );
    }
  }

  private async validatingPassword(
    newPassword: string,
    acceptNewPassword: string,
    oldPassword: string,
    password: string,
  ): Promise<void> {
    if (newPassword !== acceptNewPassword) {
      this.logger.error('Passwords do not match', 'СhangePassword');
      throw new BadRequestException('Passwords do not match');
    }

    this.logger.log(
      'Cheking is new passwords equal old password',
      'СhangePassword',
    );

    const isNewPassEqual: boolean = await argon2id.verify(
      password,
      acceptNewPassword,
    );
    if (isNewPassEqual) {
      this.logger.error('Old password matches new password', 'СhangePassword');
      throw new BadRequestException('Old password matches new password');
    }

    this.logger.log(
      "Checking if the user's old password matches the entered password",
      'СhangePassword',
    );
    const isPassEqual: boolean = await argon2id.verify(password, oldPassword);

    if (!isPassEqual) {
      this.logger.error('Old password does not match', 'СhangePassword');
      throw new BadRequestException('Old password does not match');
    }
  }

  private async hashingAndUpdatingUserPassword(
    acceptNewPassword: string,
    email: string,
  ): Promise<ChangePasswordResponseDto> {
    this.logger.log('Proceeding to hash new password', 'ChangePassword');
    const hashedNewPassword: string = await argon2id.hash(acceptNewPassword);

    this.logger.log('Updating user password', 'ChangePassword');
    return await this.userRepository.updateUserPassword(
      email,
      hashedNewPassword,
    );
  }

  private async SendKafkaChangePasswordMailAndUpdateCounter(
    email: string,
    id: number,
    counter: number,
  ): Promise<void> {
    this.logger.log('Change password email sending', 'ChangePassword');
    await this.producer.send({
      topic: 'change-password-mail',
      messages: [{ value: JSON.stringify({ to: email }) }],
    });

    this.logger.log('Password change counter updating', 'ChangePassword');
    await this.userRepository.updateChangesPasswordCounter(id, counter + 1);
  }

  private async validateUserActivateAccount(
    refreshToken: string,
  ): Promise<number> {
    this.logger.log('Checking if refresh token is valid', 'ActivateAccount');
    const { id } = await this.tokenService.verify(refreshToken);
    if (!id) {
      this.logger.error('Invalid refreshToken', 'ActivateAccount');
      throw new UnauthorizedException('Invalid refreshToken');
    }

    const { email }: FindUserByIdInterface =
      await this.userRepository.findUserById(id);
    if (!email) {
      this.logger.error(
        'User not found for the provided refresh token',
        'ActivateAccount',
      );
      throw new UnauthorizedException('User not registered');
    }
    return id;
  }

  private async validateActivateUser(
    id: number,
    link: string,
  ): Promise<string> {
    this.logger.log(
      'Checking if the activation user exists in the database',
      'ActivateAccount',
    );
    const activateUser: ActivateAccountInterface =
      await this.activateRepository.findActivateAccountUserById(id);

    if (!activateUser) {
      this.logger.error(
        'User not found in activation database',
        'ActivateAccount',
      );
      throw new UnauthorizedException('User not registered');
    }

    if (link !== activateUser.activationLink) {
      this.logger.error("It isn't the user's link.", 'ActivateAccount');
      throw new BadRequestException("It isn't user's link");
    }

    return activateUser.activationCode;
  }

  private async verifyCodeAndUpdateUser(
    id: number,
    activationCode: string,
    code: string,
  ): Promise<UpdateActivateInterface> {
    this.logger.log('Verifying activation code', 'ActivateAccount');
    const isEqual: boolean = await argon2id.verify(activationCode, code);

    if (!isEqual) {
      this.logger.error('Invalid activation code provided', 'ActivateAccount');
      throw new BadRequestException('Invalid activation code');
    }

    this.logger.log('Updating user activation status', 'ActivateAccount');
    const response: UpdateActivateInterface =
      await this.activateRepository.updateActivate(id);

    this.logger.log(
      'activate account completed successfully',
      'ActivateAccount',
    );

    return response;
  }

  private async validateUserCreateUserGuardPasswords(userId: number) {
    this.logger.log(
      'Checking if user exists for guard password creation',
      'CreateGuardPasswords',
    );
    const user: FindUserByIdInterface =
      await this.userRepository.findUserById(userId);

    if (!user) {
      this.logger.error(
        'User not found for guard password creation',
        'CreateGuardPasswords',
      );
      throw new UnauthorizedException('User need to register');
    }
  }

  private async GenerateTenOneTimePasswords(
    userId: number,
    days: number,
  ): Promise<string[]> {
    this.logger.log('Generating 10 guard passwords', 'CreateGuardPasswords');
    const passwords: string[] = [];
    const hashedPasswordsArray: string[] = [];
    for (let i: number = 0; i < 10; i++) {
      const activationCode: string = uuid.v4().replace(/-/g, '').slice(0, 8);
      passwords.push(activationCode);
      hashedPasswordsArray.push(await argon2id.hash(activationCode));
    }

    this.logger.log(
      'Updating guard passwords in database',
      'CreateGuardPasswords',
    );
    await this.userGuardRepository.updateGuardPasswords(
      hashedPasswordsArray,
      userId,
      days,
    );

    return passwords;
  }

  private async ValidateUserGenerateGoogle2fa(userId: number): Promise<string> {
    this.logger.log(
      'Checking if user exists for 2FA generation',
      'GenerateGoogle2fa',
    );
    const user: FindUserByIdInterface =
      await this.userRepository.findUserById(userId);

    if (!user) {
      this.logger.error(
        'User not found for Google 2FA generation',
        'GenerateGoogle2fa',
      );
      throw new UnauthorizedException('User not registered');
    }

    return user.email;
  }

  private async GenerateSecretAndUpdateUserGuard(
    email: string,
    userId: number,
  ): Promise<GenerateGoogle2faResponseDto> {
    this.logger.log('Generating Google 2FA secret', 'GenerateGoogle2fa');
    const secret: GoogleSecretInterface = speakeasy.generateSecret({
      name: `yArzamata ${email}`,
      issuer: 'yArzamata',
    });

    if (!secret.otpauth_url) {
      this.logger.error('OTPAuth URL was not generated', 'GenerateGoogle2fa');
      throw new BadRequestException('OTPAuth URL was not generated');
    }

    this.logger.log('Generating QR code for Google 2FA', 'GenerateGoogle2fa');
    const qrCode: string = QRCode.toDataURL(secret.otpauth_url);
    const encryptedSecret: string = this.encrypt(secret.base32);

    this.logger.log(
      'Updating user Google 2FA secret in database',
      'GenerateGoogle2fa',
    );
    await this.userGuardRepository.updateUserSecret2fa(encryptedSecret, userId);

    this.logger.log(
      'Generate google 2fa completed successfully',
      'GenerateGoogle2fa',
    );

    return {
      qrCode,
      code: secret.base32,
    };
  }

  private async ValidateUserGoogle2fa(
    email: string,
    fullName: string,
  ): Promise<number> {
    this.logger.log(
      'Checking if user exists for Google validation',
      'GoogleValidateUser',
    );
    let userId: number = (await this.userRepository.findUserIdByEmail(email))
      .id;

    if (!userId) {
      this.logger.log(
        'User not found, creating new user',
        'GoogleValidateUser',
      );
      userId = (await this.userRepository.createUser(email, fullName)).id;
    }
    return userId;
  }

  private async generateAndUpdateToken(userId: number): Promise<string> {
    this.logger.log('Generating tokens for user', 'GoogleValidateUser');
    const tokens: TokensInterface =
      await this.tokenService.generateTokens(userId);

    this.logger.log(
      'Updating refresh token for user in database',
      'GoogleValidateUser',
    );
    await this.tokenRepository.update(tokens.refreshToken, userId);
    return tokens.refreshToken;
  }

  private async chekingUserActivate(
    userId: number,
    email: string,
  ): Promise<void> {
    this.logger.log(
      'Checking if activation user exists for Google validation',
      'GoogleValidateUser',
    );
    const activateUser: GetActivateUserInterface =
      await this.activateRepository.findActivateUserById(userId);

    if (!activateUser) {
      this.logger.log(
        'Creating activation code and sending verification email',
        'GoogleValidateUser',
      );
      const activationCode: string = uuid.v4().replace(/\D/g, '').slice(0, 6);
      const activateLink: string = uuid.v4();
      const hashedActivationCode: string = await argon2id.hash(activationCode);

      this.logger.log('Creating user activation', 'GoogleValidateUser');
      await this.activateRepository.create(
        activateLink,
        hashedActivationCode,
        userId,
      );
      this.logger.log(
        'Sending Google verification email',
        'GoogleValidateUser',
      );
      await this.sendKafkaVerificationMail(email, activationCode);
    }
  }

  private async sendKafkaVerificationMail(
    email: string,
    activationCode: string,
  ): Promise<void> {
    await this.producer.send({
      topic: 'verification-mail',
      messages: [
        {
          value: JSON.stringify({
            to: email,
            code: activationCode,
          }),
        },
      ],
    });
  }

  private async sendKafkaGoogleVerificationMail(email: string): Promise<void> {
    this.logger.log('Sending Google login email', 'GoogleValidateUser');
    await this.producer.send({
      topic: 'google-login-mail',
      messages: [{ value: JSON.stringify({ to: email }) }],
    });
  }
}
