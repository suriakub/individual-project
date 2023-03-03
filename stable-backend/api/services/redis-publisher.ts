import { Redis } from 'ioredis';
class RedisPublisher {
  private publisher: Redis;

  constructor() {
    this.publisher = new Redis(6379, { lazyConnect: true });
  }

  init = async () => {
    await this.publisher.connect();
  };

  publish = async (message: WorkerTask<TaskType>) => {
    const messageString = JSON.stringify(message);
    await this.publisher.lpush('workerTasks', messageString);
  };

  get redisPublisher() {
    return this.publisher;
  }
}

export const redisPublisher: RedisPublisher = new RedisPublisher();

export enum WorkerTaskType {
  TEXT_TO_IMAGE = 'TEXT_TO_IMAGE',
  IMAGE_TO_IMAGE = 'IMAGE_TO_IMAGE',
  IMAGE_INPAINT = 'IMAGE_INPAINTING',
}

export interface WorkerTask<T> {
  taskType: WorkerTaskType;
  username: string;
  args: T;
}

export interface TextToImage {
  prompt: string;
  height: number;
  width: number;
  steps: number;
  seed?: number;
}

export interface ImageToImage {
  prompt: string;
  image: string;
  strength: number;
  steps: number;
  seed?: number;
}

export interface ImageInpainting {
  prompt: string;
  mask: string;
}

type TaskType = TextToImage | ImageToImage | ImageInpainting;
