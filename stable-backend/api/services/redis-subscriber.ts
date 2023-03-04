import { Redis } from 'ioredis';
import { socketService } from './socketio.service';

class RedisSubscriber {
  private redisSubscriber: Redis;
  private channel;

  constructor(channel: string) {
    this.channel = channel;
    this.redisSubscriber = new Redis(6379, { lazyConnect: true });
  }

  init = async () => {
    await this.redisSubscriber.connect();
    await this.redisSubscriber.subscribe(this.channel, (err) => {
      if (err) {
        console.error(`Failed to subscribe: ${err.message}`);
      }
    });
    this.redisSubscriber.on('message', (_, message) => {
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

  get redisPublisher() {
    return this.redisSubscriber;
  }
}

export const redisSubscriber: RedisSubscriber = new RedisSubscriber('workerMessages');

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
