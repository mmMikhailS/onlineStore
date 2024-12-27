import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class AppService {
  constructor(private readonly mailerService: MailerService) {}

  async VerificationMail(to: string, code: string) {
    await this.mailerService
      .sendMail({
        to,
        subject: 'verification your email',
        template: 'verification',
        context: {
          activationCode: code,
        },
        text: `your verification code ${code}`,
      })
      .catch((e) => {
        console.error(`Error sending verification email to ${to}:`, e);
        throw e;
      });
  }

  async LoginMail(to: string) {
    await this.mailerService
      .sendMail({
        to,
        subject: 'Someone has  logged on your account',
        template: 'login',
        text: `Someone has  logged on your account`,
      })
      .catch((e) => {
        console.error(`Error sending verification email to ${to}:`, e);
        throw e;
      });
  }

  async ChangedPasswordMail(to: string) {
    return await this.mailerService
      .sendMail({
        to,
        subject: 'Someone has  changed password on your account',
        template: 'changePassword',
        text: `Someone has changed password on your account`,
      })
      .catch((e) => {
        console.error(`Error sending verification email to ${to}:`, e);
        throw e;
      });
  }

  async orderMail(to: string, code: any, status: string) {
    return await this.mailerService
      .sendMail({
        to,
        subject: 'Order successfully created',
        template: 'orderSuccessfully',
        text: `Order status: ${status}. Order details: ${code}`,
      })
      .catch((e) => {
        console.error(`Error sending verification email to ${to}:`, e);
        throw e;
      });
  }

  async googleVerifyMail(to: string) {
    return await this.mailerService
      .sendMail({
        to,
        subject: 'Successful Google Sign-In',
        template: 'googleVerify',
        text: `You have successfully signed in using Google. Welcome, and enjoy our service!`,
      })
      .catch((e) => {
        console.error(
          `Error sending Google sign-in confirmation email to ${to}:`,
          e,
        );
        throw e;
      });
  }
}
