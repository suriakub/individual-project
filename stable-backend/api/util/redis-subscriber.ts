import * as redis from 'redis';
import { WorkerTask } from './redis-publisher';

class RedisSubscriber {
  private _redisSubscriber: ReturnType<typeof redis.createClient>;

  constructor(channel: string) {
    this._redisSubscriber = redis.createClient();
    this._redisSubscriber.subscribe(channel, (message) => {
      const jsonMessage = JSON.parse(message);
      console.log(`REDIS SUB: Received ${message}`);
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

export interface WorkerMessage {
  filename: string
}