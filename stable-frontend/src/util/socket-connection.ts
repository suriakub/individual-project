import io from 'socket.io-client';

let socket = io('http://localhost:8082');

export default socket;