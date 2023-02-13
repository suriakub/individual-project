import * as redis from 'redis';
import { socketService } from './socketio.service';
import fs from 'fs';

class RedisSubscriber {
  private _redisSubscriber: ReturnType<typeof redis.createClient>;

  constructor(channel: string) {
    this._redisSubscriber = redis.createClient();
    this._redisSubscriber.subscribe(channel, (message) => {
      const jsonMessage: WorkerMessage = JSON.parse(message);
      console.log(`REDIS SUB: Received ${message}`);

      try {
        // Message listeners
        if (jsonMessage.type === WorkerMessageType.IMAGE_INFO) {
          const { filename, progress, username } = jsonMessage as WorkerImageMessage;
          const image = fs.readFileSync(`../images/${filename}`, { encoding: 'base64' });
          socketService.io.to(username).emit('image', { image, progress });
        }
      } catch (e) {
        console.log(e);
      }
    });
  }

  init = async () => {
    await this._redisSubscriber.connect();
  };

  get redisPublisher() {
    return this._redisSubscriber;
  }
}

export const redisSubscriber: RedisSubscriber = new RedisSubscriber('workerMessages');

interface WorkerMessage {
  type: WorkerMessageType;
  username: string;
}

interface WorkerImageMessage extends WorkerMessage {
  filename: string;
  progress: number;
}

enum WorkerMessageType {
  IMAGE_INFO = 'IMAGE_INFO',
}
