import { NextFunction, Request, Response } from 'express';
import { ImageToImage, redisPublisher, TextToImage, WorkerTask, WorkerTaskType } from '../services/redis-publisher';
import { mergeImages } from '../util/image';

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
  let { image, mask } = req.body.args;

  try {
    req.body.args.image = await mergeImages(image, mask);
    delete req.body.args.mask;
  } catch (e) {
    res.status(400).json({
      error: 'Please provide a valid image.'
    })
  }

  const task: WorkerTask<ImageToImage> = {
    taskType: WorkerTaskType.IMAGE_TO_IMAGE,
    ...req.body,
  };

  try {
    await redisPublisher.publish(task);

    res.status(200).json({
      message: 'Generating image...',
    });
  } catch (e) {
    next(e);
  }
};
