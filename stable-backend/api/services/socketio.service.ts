import { Server as SocketServer, Socket } from 'socket.io';
import http from 'http';

class SocketIOService {
  private _io = new SocketServer();

  init = (server: http.Server) => {
    this._io = new SocketServer(server, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST'],
        allowedHeaders: '*',
      },
    });

    // for debugging
    this._io.on('connection', (socket: Socket) => {
      console.log('a user connected', socket.id);
    });
    // for debugging
    this._io.on('disconnect', () => {
      console.log('user disconnected');
    });
  };

  get io() {
    return this._io;
  }
}

export const socketService: SocketIOService = new SocketIOService();
