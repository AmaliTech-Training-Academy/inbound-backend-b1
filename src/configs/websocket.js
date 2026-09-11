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

    socket.on('join-inbox', (payload = {}, acknowledge) => {
      const { address, token } = payload;

      if (typeof address !== 'string' || !address.trim() || typeof token !== 'string' || !token.trim()) {
        acknowledge?.({ success: false, error: 'address and token are required' });
        return;
      }

      const room = `inbox:${address.trim().toLowerCase()}`;
      socket.join(room);
      console.log(`Client ${socket.id} joined inbox: ${address}`);
      acknowledge?.({ success: true, room });
    });

    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  
})
return io;
};