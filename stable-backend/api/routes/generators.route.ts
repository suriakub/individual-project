import express from 'express';
import { textToImage } from '../controllers/generators.controller';

export const imageGeneratorRouter = express.Router();

imageGeneratorRouter.post('/text-to-image', textToImage);
