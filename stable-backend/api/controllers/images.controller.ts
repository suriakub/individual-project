import { NextFunction, Request, Response } from 'express';
import { Image } from '../models/image.model';
import { ImageCollection } from '../models/image-collection.model';

export const getUserImages = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const imageCollections = await ImageCollection.findAll({
      where: { userId: req.params.userUuid },
      include: { model: Image, required: true },
    });

    const imageNames = imageCollections.flatMap((collection) =>
    // @ts-ignore
      (collection.images as Image[]).map((image) => image.name),
    );

    res.status(200).json({
      imageNames,
    });
  } catch (e) {
    next(e);
  }
};
