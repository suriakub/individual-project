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

      // Message listeners
      switch (jsonMessage.type) {
        case WorkerMessageType.IMAGE_INFO:
          const { filename } = jsonMessage as WorkerImageMessage;
          const image = fs.readFileSync(`../images/${filename}`, { encoding: 'base64' });
          socketService.io.emit('image', image);
          break;

        case WorkerMessageType.PROGRESS:
          const progressMessage = jsonMessage as WorkerProgressMessage;
          socketService.io.emit('progress', progressMessage.progress);
          break;
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
  userId: number;
}

interface WorkerImageMessage extends WorkerMessage {
  filename: string;
}

interface WorkerProgressMessage extends WorkerMessage {
  progress: number;
}

enum WorkerMessageType {
  PROGRESS = 'PROGRESS',
  IMAGE_INFO = 'IMAGE_INFO',
}
