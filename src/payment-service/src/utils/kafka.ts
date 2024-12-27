import { Kafka } from 'kafkajs';

export const kafka: Kafka = new Kafka({
  clientId: process.env.CONSUMER_AUTH_ID || 'auth-client',
  brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
});