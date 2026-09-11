import { Server } from 'socket.io';

export const initWebSocket = (server) => {
  
    const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  io.on('connection', (socket) => {
    console.log(`New client connected: ${socket.id}`);

    socket.on('join-inbox', async({address,token}) => {
        socket.join(address);
        console.log(`Client ${socket.id} joined inbox: ${address}`);
    });

    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  
})
return io;
};