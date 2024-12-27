import { actionTopicType } from '../utils/utils';

export interface KafkaEachMessageInterface {
  topic: actionTopicType;
  message: {
    key: Buffer | null;
    value: JSON;
    headers?: Record<string, Buffer | undefined>;
    timestamp: string;
    size: number;
    attributes: number;
    offset: string;
  };
}
