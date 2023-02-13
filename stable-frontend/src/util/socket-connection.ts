import io from 'socket.io-client';

const username = localStorage.getItem('username');

let socket: ReturnType<typeof io> | null = null;
if (username !== null) {
  socket = io('http://localhost:8082', {
    query: {
      username: localStorage.getItem('username')
    }
  });
}

export default socket;
