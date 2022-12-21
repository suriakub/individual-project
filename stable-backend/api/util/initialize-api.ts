import express, { Express } from 'express';
import { imageGeneratorRouter } from '../routes/generators.route';
import { errorHandlerMiddleware } from '../middlewares/error-handler';
import { corsMiddleware } from '../middlewares/cors';
import { redisPublisher } from './redis-publisher';
import { redisSubscriber } from './redis-subscriber';

export const initializeApi = async (): Promise<Express> => {
  await redisPublisher.init();
  await redisSubscriber.init();

  const server: Express = express();

  server.use(corsMiddleware);
  server.use(express.json());
  server.use(express.urlencoded({extended: true}));
  
  server.use('/generators', imageGeneratorRouter);
  server.use(errorHandlerMiddleware);

  return server;
};
