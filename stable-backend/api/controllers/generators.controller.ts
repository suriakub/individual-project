import { NextFunction, Request, Response } from 'express';
import { redisPublisher, WorkerTask, WorkerTaskType } from '../services/redis-publisher';
import { socketService } from '../services/socketio.service';

export const textToImage = async (req: Request, res: Response, next: NextFunction) => {
  const task: WorkerTask = {
    taskType: WorkerTaskType.TEXT_TO_IMAGE,
    ...req.body,
  };

  try {
    await redisPublisher.publish(task);
    socketService.io.emit('data', { hello: 'world', ahoj: 'svet' });

    res.status(200).json({
      msg: 'Generating image...',
    });
  } catch (e) {
    next(e);
  }
};
