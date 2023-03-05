import io from 'socket.io-client';

const username = localStorage.getItem('username');

if (!process.env.REACT_APP_API_BASE_URL) {
  throw new Error();
}

let socket: ReturnType<typeof io> | null = null;
if (username !== null) {
  socket = io(process.env.REACT_APP_API_BASE_URL, {
    query: {
      username: localStorage.getItem('username')
    }
  });
}

export default socket;
