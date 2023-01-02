import express, { NextFunction, Request, Response } from 'express';
import { textToImage } from '../controllers/generators.controller';

export const imageGeneratorRouter = express.Router();

export const textToImageMock = async (req: Request, res: Response, next: NextFunction) => {
  res.status(200).json({
    msg: 'generating image...',
    imageName: 'bird.png',
  });
};

imageGeneratorRouter.post('/text-to-image', textToImage);
imageGeneratorRouter.post('/text-to-image-mock', textToImageMock);
