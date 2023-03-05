import { NextFunction, Request, Response } from 'express';
import { mergeImages } from '../util/image';

export const postMerge = async (req: Request, res: Response, next: NextFunction) => {
  let { image, mask } = req.body;
  res.status(200).json({
    image: await mergeImages(image, mask),
  });
};
