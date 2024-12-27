import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { kafka } from './kafka/kafka';
import { v4 as uuidv4 } from 'uuid';
import {
  actionDataType,
  actionTopicType,
  mapPromiseType,
  Message,
} from './utils/utils';

@Injectable()
export class PaymentService implements OnModuleInit, OnModuleDestroy {
  producer: any;

  constructor() {
    this.producer = kafka.producer();
  }

  async onModuleInit(): Promise<void> {
    await this.producer.connect();
    console.log('producer connected');
  }

  async onModuleDestroy(): Promise<void> {
    await this.producer.disconnect();
    console.log('producer connected');
  }

  async promiseSendMessage<T>(
    data: actionDataType,
    mapPromise: mapPromiseType<T>,
    topic: actionTopicType,
  ): Promise<T> {
    const messageId: string = uuidv4();

    const promise = new Promise<T>((resolve, reject): void => {
      mapPromise.set(messageId, {
        resolve,
        reject,
      });
    });

    await this.producer
      .send({
        topic,
        messages: [{ value: JSON.stringify(new Message(data, messageId)) }],
      })
      .catch((e: any): never => {
        console.error(`payment gateway error: ` + e);
        throw e;
      });
    return await promise;
  }
}
