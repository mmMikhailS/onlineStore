import {
  BadRequestException,
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { kafka } from './utils/kafka';
import { AppService } from './app.service';
import {
  actionDataType,
  actionTopicType,
  Message,
  methodName,
  topics,
} from './utils/utils';
import { KafkaEachMessageInterface } from './interfaces/kafkaEachMessage.interface';
import { ResultInterface } from './interfaces/result.interface';

@Injectable()
export class AppController implements OnModuleInit, OnModuleDestroy {
  consumer: any;
  producer: any;

  constructor(private readonly appService: AppService) {
    this.consumer = kafka.consumer({ groupId: 'payment' });
    this.producer = kafka.producer();
  }

  async onModuleInit(): Promise<void> {
    await this.producer.connect();
    await this.consumer.connect();
    console.log('consumer and producer connected');
    for (const topic of topics) {
      await this.consumer.subscribe({ topic });
    }
    await this.consumer.run({
      eachMessage: async ({
        topic,
        message,
      }: KafkaEachMessageInterface): Promise<void> => {
        try {
          if (!message.value) {
            throw new BadRequestException('message value equals undefined');
          }

          const { data, messageId } = JSON.parse(message.value.toString());
          if (!data || !messageId) {
            throw new BadRequestException('data or messageId equals undefined');
          }

          await this.performAction(
            data,
            this.appService[methodName(topic)],
            messageId,
            topic,
          );
        } catch (e) {
          const { messageId } = JSON.parse(message.value.toString());
          await this.producer.send({
            topic: topic + '-response',
            messages: [
              {
                value: JSON.stringify(
                  new Message(
                    {
                      errorMessage: e.message,
                      httpStatus: e.statusCode,
                    },
                    messageId,
                  ),
                ),
              },
            ],
          });
        }
      },
    });
  }

  async onModuleDestroy(): Promise<void> {
    await this.consumer.disconnect();
    await this.producer.disconnect();
    console.log('consumer and producer disconnected');
  }

  async performAction(
    data: actionDataType,
    action: (data: actionDataType) => Promise<any>,
    messageId: string,
    topic: actionTopicType,
  ) {
    try {
      const result: ResultInterface = await action.call(this.appService, data);
      return await this.producer.send({
        topic: `${topic}-response`,
        messages: [{ value: JSON.stringify(new Message(result, messageId)) }],
      });
    } catch (e) {
      await this.producer.send({
        topic: `${topic}-response`,
        messages: [
          {
            value: JSON.stringify(
              new Message(
                {
                  errorMessage: e.message,
                  httpStatus: e.statusCode,
                },
                messageId,
              ),
            ),
          },
        ],
      });
    }
  }
}
