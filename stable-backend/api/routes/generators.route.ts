import express from 'express';
import { imageToImage, textToImage } from '../controllers/generators.controller';
import { imageToImageValidator, textToImageValidator } from '../middlewares/validators';

export const imageGeneratorRouter = express.Router();

imageGeneratorRouter.route('/image-to-image').post(imageToImageValidator, imageToImage);

imageGeneratorRouter.route('/text-to-image').post(textToImageValidator, textToImage);
