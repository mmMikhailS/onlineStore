import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Req,
  Res,
  SerializeOptions,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { Request, Response } from 'express';
import { guardAccountDto } from './dto/guardAccount.dto';
import { registrationUserDto } from './dto/registrationUserDto.dto';
import { loginDto } from './dto/login.dto';
import { changePassDto } from './dto/changePass.dto';
import { RegisterResponseDto } from './dto/responseDto/register.response.dto';
import { GuardResponseDto } from './dto/responseDto/guard.response.dto';
import { LogoutResponseDto } from './dto/responseDto/logout.response.dto';
import { DeleteAccountResponseDto } from './dto/responseDto/deleteAccount.response.dto';
import { ChangePasswordResponseDto } from './dto/responseDto/changePassword.response.dto';
import { RefreshTokensResponseDto } from './dto/responseDto/refresh.response.dto';
import { ActivateAccountResponseDto } from './dto/responseDto/activateAccount.response.dto';
import { CreateGuardPasswordsResponseDto } from './dto/responseDto/createGuardPasswords.response.dto';
import { PayloadInterface } from './interfaces/payload.interface';
import { LoginResponseDto } from './dto/responseDto/login.response.dto';

@Controller('/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiTags('Authorization')
  @ApiOperation({ summary: 'Register a new user' })
  @SerializeOptions({ type: RegisterResponseDto })
  @HttpCode(200)
  @Post('/register')
  async register(
    @Body() dto: registrationUserDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<RegisterResponseDto> {
    try {
      const { refreshToken, ...response }: RegisterResponseDto =
        await this.authService.register(dto);

      this.authService.addRefreshTokenToResponse(refreshToken, res);
      return response;
    } catch (e) {
      console.error('Error during registration:', e);
      throw e;
    }
  }

  @ApiTags('Authorization')
  @ApiOperation({ summary: 'login user' })
  @SerializeOptions({ type: LoginResponseDto })
  @HttpCode(200)
  @Post('login')
  async login(
    @Res({ passthrough: true }) res: Response,
    @Body() dto: loginDto,
  ): Promise<LoginResponseDto> {
    try {
      const {
        refreshToken,
        twoStepVerification,
        ...response
      }: LoginResponseDto = await this.authService.login(dto);

      if (twoStepVerification) {
        this.authService.addGuardTokenToResponse(refreshToken, res);
      } else {
        this.authService.addRefreshTokenToResponse(refreshToken, res);
      }

      return { twoStepVerification, ...response };
    } catch (e) {
      console.error('Error during login:', e);
      throw e;
    }
  }

  @ApiTags('Authorization')
  @ApiOperation({ summary: 'activate user' })
  @SerializeOptions({ type: GuardResponseDto })
  @HttpCode(201)
  @Post('guard')
  async guard(
    @Body() data: guardAccountDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<GuardResponseDto> {
    try {
      const { id } = req.guardPayload;
      if (!id) {
        throw new UnauthorizedException('invalid guard token)');
      }

      const { refreshToken, ...response }: GuardResponseDto =
        await this.authService.guard({
          ...data,
          userId: id,
        });

      this.authService.addRefreshTokenToResponse(refreshToken, res);

      return response;
    } catch (e) {
      console.error('Error during guard:', e);
      throw e;
    }
  }

  @ApiTags('Authorization')
  @ApiOperation({ summary: 'Logout' })
  @SerializeOptions({ type: LogoutResponseDto })
  @HttpCode(200)
  @Get('/logout')
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<LogoutResponseDto> {
    try {
      const refreshToken: string =
        req.headers[this.authService.REFRESH_TOKEN_HEADER_NAME].split(' ')[1];
      const response: LogoutResponseDto =
        await this.authService.logout(refreshToken);

      this.authService.clearRefreshToken(res);
      return response;
    } catch (e) {
      console.error('Error during logout:', e);
      throw e;
    }
  }

  @ApiTags('Authorization')
  @ApiOperation({ summary: 'delete account' })
  @SerializeOptions({ type: DeleteAccountResponseDto })
  @HttpCode(201)
  @Delete('/deleteAccount')
  async deleteAccount(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<DeleteAccountResponseDto> {
    try {
      const refreshToken: string =
        req.headers[this.authService.REFRESH_TOKEN_HEADER_NAME].split(' ')[1];

      const response: DeleteAccountResponseDto =
        await this.authService.deleteAccount(refreshToken);

      this.authService.clearRefreshToken(res);
      return response;
    } catch (e) {
      console.error('Error during deleteAccount:', e);
      throw e;
    }
  }

  @ApiTags('Authorization')
  @ApiOperation({ summary: 'Change password' })
  @SerializeOptions({ type: ChangePasswordResponseDto })
  @HttpCode(200)
  @Post('changePassword')
  async changePassword(
    @Body() dto: changePassDto,
  ): Promise<ChangePasswordResponseDto> {
    try {
      return this.authService.changePassword(dto);
    } catch (e) {
      console.error('Error during changePassword:', e);
      throw e;
    }
  }

  @ApiTags('Authorization')
  @ApiOperation({ summary: 'activate user' })
  @SerializeOptions({ type: ActivateAccountResponseDto })
  @HttpCode(200)
  @Post('activate/:link')
  async activateAccount(
    @Body('code') code: string,
    @Req() req: Request,
    @Param('link') link: string,
  ): Promise<ActivateAccountResponseDto> {
    try {
      const refreshToken: string =
        req.headers[this.authService.REFRESH_TOKEN_HEADER_NAME].split(' ')[1];
      return this.authService.activateAccount({
        code,
        link,
        refreshToken,
      });
    } catch (e) {
      console.error('Error during activateAccount:', e);
      throw e;
    }
  }

  @ApiTags('Authorization')
  @ApiOperation({ summary: 'refresh tokens' })
  @SerializeOptions({ type: RefreshTokensResponseDto })
  @HttpCode(200)
  @Get('refresh')
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<RefreshTokensResponseDto> {
    try {
      const headerRefreshToken: string =
        req.headers[this.authService.REFRESH_TOKEN_HEADER_NAME].split(' ')[1];

      const { refreshToken, ...response }: RefreshTokensResponseDto =
        await this.authService.refreshTokens(headerRefreshToken);

      this.authService.addRefreshTokenToResponse(refreshToken, res);
      return response;
    } catch (e) {
      console.error('Error during refresh:', e);
      throw e;
    }
  }

  @ApiTags('Authorization')
  @ApiOperation({ summary: 'activate user' })
  @SerializeOptions({ type: CreateGuardPasswordsResponseDto })
  @HttpCode(200)
  @Post('createDoubleGuardPasswords')
  async createDoubleGuardPasswords(
    @Body('days') days: number,
    @Req() req: Request,
  ): Promise<CreateGuardPasswordsResponseDto> {
    try {
      const payload: PayloadInterface = req.payload;
      if (!payload) {
        throw new UnauthorizedException('User not registered');
      }
      return this.authService.createGuardPasswords({
        userId: payload.id,
        days,
      });
    } catch (e) {
      console.error('Error during createDoubleGuardPasswords:', e);
      throw e;
    }
  }

  @ApiTags('Authorization')
  @ApiOperation({ summary: 'activate user' })
  // @SerializeOptions({ type: CreateGuardPasswordsResponseDto })
  @HttpCode(200)
  @Post('generateGoogle2fa')
  async generateGoogle2fa() {
    // :Promise<GenerateGoogle2faResponseDto>
    // @Req() req: Request, @Res() res: Response
    // const payload: PayloadInterface = req.payload;
    // const createdGuardPasswords: any = await this.authService.generateGoogle2fa(
    //   payload.userId,
    // );
    //
    // if (createdGuardPasswords.success) {
    //   return res.status(200).json(createdGuardPasswords);
    // }
    // return res
    //   .status(createdGuardPasswords.httpStatus)
    //   .json({ message: createdGuardPasswords.errorMessage });
  }

  // @ApiTags('Authorization')
  // @ApiOperation({ summary: 'sign in or sign up with google' })
  // @Get('/google/login')
  // @UseGuards(GoogleAuthGuard)
  // async handleLogin() {
  //   return { message: 'Redirecting to Google for authentication' };
  // }

  // @ApiTags('Authorization')
  // @Get('/google/redirect')
  // @UseGuards(GoogleAuthGuard)
  // @ApiOperation({ summary: 'sign in or sing up with google' })
  // async handleRedirect(@Req() req: any, @Res() res: Response) {
  //   const { success, email, fullName, tokens, errorMessage } = req.user;
  //   console.log(success, email, fullName, tokens);
  //   if (success) {
  //     req.session.accessToken = tokens.accessToken;
  //     req.session.refreshToken = tokens.refreshToken;
  //     return res.status(200).json({ success, ...tokens, email, fullName });
  //   }
  //   return res.status(400).json({ message: errorMessage });
  // }
}
