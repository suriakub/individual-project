import express from 'express';
import { getUserImages, postMerge } from '../controllers/images.controller';
import { mergeImagesValidator } from '../middlewares/validators';

export const imagesRouter = express.Router();

imagesRouter.get('/user/:userUuid', getUserImages);

imagesRouter.route('/merge').post(mergeImagesValidator, postMerge);
