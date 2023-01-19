import express, { Express } from 'express';
import { imageGeneratorRouter } from '../routes/generators.route';
import { errorHandlerMiddleware } from '../middlewares/error-handler';
import { mysql } from '../services/mysql';
import { redisPublisher } from '../services/redis-publisher';
import { redisSubscriber } from '../services/redis-subscriber';
import { corsMiddleware } from '../middlewares/cors';
import { socketService } from '../services/socketio.service';
import http from 'http';
import { imagesRouter } from '../routes/images.route';

export const initializeApi = async (): Promise<http.Server> => {
  await redisPublisher.init();
  await redisSubscriber.init();
  console.log('Redis connections successfully established.');
  await mysql.init();
  console.log('DB connection successfully established.');

  const expressServer: Express = express();

  expressServer.use(corsMiddleware);
  expressServer.use(express.json());
  expressServer.use(express.urlencoded({ extended: true }));
  expressServer.use(express.static('../images'));

  expressServer.use('/generators', imageGeneratorRouter);
  expressServer.use('/images', imagesRouter);
  expressServer.use(errorHandlerMiddleware);

  // we need to transform the express server into http server otherwise
  // socket.io won't work
  const server = http.createServer(expressServer);
  socketService.init(server);
  return server;
};
