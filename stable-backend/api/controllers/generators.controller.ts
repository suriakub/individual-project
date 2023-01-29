import { NextFunction, Request, Response } from 'express';
import { ImageToImage, redisPublisher, TextToImage, WorkerTask, WorkerTaskType } from '../services/redis-publisher';

export const textToImage = async (req: Request, res: Response, next: NextFunction) => {
  const task: WorkerTask<TextToImage> = {
    taskType: WorkerTaskType.TEXT_TO_IMAGE,
    ...req.body,
  };

  try {
    await redisPublisher.publish(task);

    res.status(200).json({
      msg: 'Generating image...',
    });
  } catch (e) {
    next(e);
  }
};

export const imageToImage = async (req: Request, res: Response, next: NextFunction) => {
  const task: WorkerTask<ImageToImage> = {
    taskType: WorkerTaskType.IMAGE_TO_IMAGE,
    ...req.body,
  };

  try {
    await redisPublisher.publish(task);

    res.status(200).json({
      msg: 'Generating image...',
    });
  } catch (e) {
    next(e);
  }
};
