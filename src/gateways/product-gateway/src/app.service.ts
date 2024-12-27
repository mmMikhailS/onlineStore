import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { kafka } from './kafka/kafka';
import { v4 as uuidv4 } from 'uuid';
import { actionDataTypes, actionTopicType, Message } from './utils/utils';

@Injectable()
export class AppService implements OnModuleInit, OnModuleDestroy {
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
    console.log('producer disconnected');
  }

  async promiseSendMessage<T>(
    data: actionDataTypes,
    promiseMap: any,
    topic: actionTopicType,
  ): Promise<T> {
    try {
      const messageId: string = uuidv4();
      const promise = new Promise<T>((resolve, reject): void => {
        promiseMap.set(messageId, {
          resolve,
          reject,
        });
      });

      await this.producer
        .send({
          topic,
          messages: [{ value: JSON.stringify(new Message(data, messageId)) }],
        })
        .then((result) => {
          console.log('message sent: ' + result);
          return result;
        })
        .catch((e: any): never => {
          console.error(`payment gateway error: ` + e);
          throw e;
        });
      return await promise;
    } catch (e) {
      throw e;
    }
  }
}
