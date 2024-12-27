import {
  BadRequestException,
  Controller,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { kafka } from './kafka';
import { actionPromise, responseTopics } from '../utils/utils';
import { KafkaEachMessageInterface } from '../interfaces/kafkaEachMessage.interface';

@Controller()
export class AppResponseController implements OnModuleInit, OnModuleDestroy {
  consumer: any;

  constructor() {
    this.consumer = kafka.consumer({ groupId: 'product-response' });
  }

  async onModuleInit(): Promise<void> {
    await this.consumer.connect();
    console.log('consumer connected');
    for (const topic of responseTopics) {
      await this.consumer.subscribe({ topic });
    }
    await this.consumer.run({
      eachMessage: async ({
        topic,
        message,
      }: KafkaEachMessageInterface): Promise<void> => {
        if (!message.value)
          throw new BadRequestException('message value equals undefined');

        const { data, messageId } = JSON.parse(message.value.toString());
        if (!data || !messageId)
          throw new BadRequestException('data and messageId equals undefined');
        if (actionPromise[topic]) {
          const pendingRequest = actionPromise[topic].get(messageId);
          pendingRequest.resolve(data);
        }
      },
    });
  }

  async onModuleDestroy(): Promise<void> {
    await this.consumer.disconnect();
    console.log('consumer disconnect');
  }
}
