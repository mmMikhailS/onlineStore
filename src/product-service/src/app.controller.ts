import {
  BadRequestException,
  Controller,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ProductRepository } from './repository/product.repository';
import { ProductService } from './app.service';
import { kafka } from './utils/kafka';
import {
  actionTopicType,
  dataType,
  handler,
  Message,
  topics,
} from './utils/utils';
import { KafkaEachMessageInterface } from './interfaces/kafkaEachMessage.interface';
import { ResultInterface } from './interfaces/result.interface';

@Controller('products')
export class AppController implements OnModuleDestroy, OnModuleInit {
  consumer: any;
  producer: any;

  constructor(
    private productService: ProductService,
    private productRepository: ProductRepository,
  ) {
    this.consumer = kafka.consumer({ groupId: 'product' });
    this.producer = kafka.producer();
  }

  async onModuleInit(): Promise<void> {
    const messageHandler: Record<string, handler> = {
      'get-all-products': this.productRepository.getAllProducts.bind(
        this.productRepository,
      ),
      'create-product': this.productService.createProduct.bind(
        this.productService,
      ),
      'delete-product': this.productRepository.deleteProduct.bind(
        this.productRepository,
      ),
    };
    await this.producer.connect();
    await this.consumer.connect();
    await this.consumer.subscribe({ topics });
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
            messageHandler[topic],
            data,
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
                      httpStatus: e.status,
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
    await this.producer.disconnect();
    await this.consumer.disconnect();
    console.log('producer and consumer disconnected');
  }

  async performAction(
    action: (data: dataType) => Promise<any>,
    data: dataType,
    messageId: string,
    topic: actionTopicType,
  ): Promise<void> {
    try {
      const result: Promise<ResultInterface> = await action.call(
        this.productRepository,
        data,
      );
      await this.producer.send({
        topic: topic + '-response',
        messages: [
          {
            value: JSON.stringify(new Message({ ...result }, messageId)),
          },
        ],
      });
    } catch (e) {
      console.error(e);
      await this.producer.send({
        topic: topic + '-response',
        messages: [
          {
            value: JSON.stringify(
              new Message(
                {
                  errorMessage: e.message,
                  httpStatus: e.status,
                },
                messageId,
              ),
            ),
          },
        ],
      });
      throw e;
    }
  }
}
