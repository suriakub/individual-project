import * as redis from 'redis';

class RedisPublisher {
  private _publisher: ReturnType<typeof redis.createClient>;

  constructor() {
    this._publisher = redis.createClient();
  }

  init = async () => {
    await this._publisher.connect();
  };

  publish = async (message: WorkerTask) => {
    const messageString = JSON.stringify(message);
    const queueSize = await this._publisher.lPush('workerTasks', messageString);
    console.log(`REDIS PUB: Task sent. Number of tasks in queue: ${queueSize}`)
  };

  get redisPublisher() {
    return this._publisher;
  }
}

export const redisPublisher: RedisPublisher = new RedisPublisher();

export enum WorkerTaskType {
  TEXT_TO_IMAGE = 'TEXT_TO_IMAGE',
  IMAGE_TO_IMAGE = 'IMAGE_TO_IMAGE',
}

export interface WorkerTask {
  taskType: WorkerTaskType;
  userId: string;
  args: {
    prompt: string,
    height: number,
    width: number,
    steps: number,
    seed?: number
  }
}
