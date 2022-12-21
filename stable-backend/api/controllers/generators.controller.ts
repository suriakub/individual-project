import { NextFunction, Request, Response } from 'express';
import { redisPublisher, WorkerTask, WorkerTaskType } from '../util/redis-publisher';

export const textToImage = async (req: Request, res: Response, next: NextFunction) => {
  const task: WorkerTask = {
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
