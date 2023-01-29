import express, { NextFunction, Request, Response } from 'express';
import { imageToImage, textToImage } from '../controllers/generators.controller';

export const imageGeneratorRouter = express.Router();

const textToImageMock = async (req: Request, res: Response, next: NextFunction) => {
  res.status(200).json({
    msg: 'generating image...',
    imageName: 'bird.png',
  });
};

imageGeneratorRouter.post('/image-to-image', imageToImage);

imageGeneratorRouter.post('/text-to-image', textToImage);

imageGeneratorRouter.post('/text-to-image-mock', textToImageMock);
