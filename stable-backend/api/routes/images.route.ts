import express from 'express';
import { getUserImages } from '../controllers/images.controller';

export const imagesRouter = express.Router();

imagesRouter.get('/user/:userUuid', getUserImages);
