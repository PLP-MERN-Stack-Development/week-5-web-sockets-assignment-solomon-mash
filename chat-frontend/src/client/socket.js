import { io } from 'socket.io-client';

const token = JSON.parse(localStorage.getItem('user'))?.token;

const socket = io('http://localhost:5000', {
  auth: { token },
  autoConnect: false,
});

export default socket;
