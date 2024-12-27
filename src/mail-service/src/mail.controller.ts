import {
  BadRequestException,
  Controller,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { kafka } from './utils/kafka';
import { AppService } from './app.service';
import { handlerType, topics } from './utils/utils';
import { KafkaEachMessageInterface } from './interfaces/kafkaEachMessage.interface';

@Controller('mail')
export class MailController implements OnModuleInit, OnModuleDestroy {
  consumer: any;

  constructor(private readonly mailService: AppService) {
    this.consumer = kafka.consumer({ groupId: 'mail' });
  }

  async onModuleInit() {
    try {
      const mailServices: Record<string, handlerType> = {
        'verification-mail': this.mailService.VerificationMail.bind(
          this.mailService,
        ),
        'login-mail': this.mailService.LoginMail.bind(this.mailService),
        'change-password-mail': this.mailService.ChangedPasswordMail.bind(
          this.mailService,
        ),
        'order-mail': this.mailService.orderMail.bind(this.mailService),
        'google-login-mail': this.mailService.googleVerifyMail.bind(
          this.mailService,
        ),
      };
      await this.consumer.connect();
      console.log('consumer connected');

      for (const topic of topics) {
        await this.consumer.subscribe({ topic });
      }
      await this.consumer.run({
        eachMessage: async ({
          topic,
          message,
        }: KafkaEachMessageInterface): Promise<void> => {
          if (!message.value) {
            throw new BadRequestException('message value equals undefined');
          }
          const value = JSON.parse(message.value.toString());

          if (!value) {
            throw new BadRequestException('message value equals undefined');
          }

          const { to, code } = value;
          if (!to) {
            throw new BadRequestException('to equals undefined');
          }

          if (mailServices[topic]) {
            await mailServices[topic](to, code);
          }
        },
      });
    } catch (error) {
      console.error('Error initializing Kafka consumer:', error);
      throw error;
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.consumer.disconnect();
    console.log('consumer disconnected');
  }
}
