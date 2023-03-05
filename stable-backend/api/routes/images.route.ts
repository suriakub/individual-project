import express from 'express';
import { postMerge } from '../controllers/images.controller';
import { mergeImagesValidator } from '../middlewares/validators';

export const imagesRouter = express.Router();

imagesRouter.route('/merge').post(mergeImagesValidator, postMerge);
