import dotenv from 'dotenv';
import { Redis } from 'ioredis';
import { socketService } from './socketio.service';

class RedisSubscriber {
  private subscriber: Redis;
  private channel: string;

  constructor() {
    dotenv.config();
    if (!process.env.LISTEN_QUEUE) throw new Error('LISTEN_QUEUE environment variable is not defined.');
    if (!process.env.REDIS_HOST) throw new Error('REDIS_HOST environment variable is not defined.');
    this.channel = process.env.LISTEN_QUEUE;
    this.subscriber = new Redis(6379, process.env.REDIS_HOST, { lazyConnect: true });
  }

  init = async () => {
    await this.subscriber.connect();
    await this.subscriber.subscribe(this.channel, (err) => {
      if (err) {
        console.error(`Failed to subscribe: ${err.message}`);
      }
    });
    this.subscriber.on('message', (_, message) => {
      try {
        const jsonMessage: WorkerMessage | undefined = JSON.parse(message);

        // Message listeners
        if (jsonMessage?.type === WorkerMessageType.IMAGE_INFO) {
          const { image, step, totalSteps, username } = jsonMessage as WorkerImageMessage;
          socketService.io.to(username).emit('image', { image, step, totalSteps });
        } else if (jsonMessage?.type === WorkerMessageType.ERROR) {
          const { error, username } = jsonMessage as WorkerErrorMessage;
          socketService.io.to(username).emit('error', { error });
        }
      } catch (e) {
        console.log(e);
      }
    });
  };
}

export const redisSubscriber: RedisSubscriber = new RedisSubscriber();

interface WorkerMessage {
  type: WorkerMessageType;
  username: string;
}

interface WorkerImageMessage extends WorkerMessage {
  image: string;
  step: number;
  totalSteps: number;
}

interface WorkerErrorMessage extends WorkerMessage {
  error: string;
}

enum WorkerMessageType {
  IMAGE_INFO = 'IMAGE_INFO',
  ERROR = 'ERROR',
}
