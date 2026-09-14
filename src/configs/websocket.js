import { Server } from 'socket.io';
import { verifyInboxAccess } from '../lib/inboxAccess.js';

export function publishNewMessage(io, inboxId, message) {
  io.to(`inbox:${inboxId}`).emit('message:new', {
    id: message.id,
    fromAddress: message.fromAddress,
    subject: message.subject,
    receivedAt: message.receivedAt
  });
}

export const initWebSocket = (server, checkInboxAccess = verifyInboxAccess) => {
  
    const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  io.on('connection', (socket) => {
    console.log(`New client connected: ${socket.id}`);

    socket.on('join-inbox', async (payload = {}, acknowledge) => {
      const { address, token } = payload;

      if (typeof address !== 'string' || !address.trim() || typeof token !== 'string' || !token.trim()) {
        acknowledge?.({ success: false, error: 'address and token are required' });
        return;
      }

      const normalizedAddress = address.trim().toLowerCase();
      let inbox;

      try {
        inbox = await checkInboxAccess(normalizedAddress, token);
      } catch (error) {
        console.error(`Failed to validate inbox access: ${error.message}`);
        acknowledge?.({ success: false, error: 'unable to validate inbox credentials' });
        return;
      }

      if (!inbox) {
        acknowledge?.({ success: false, error: 'invalid or expired inbox credentials' });
        return;
      }

      const room = `inbox:${inbox.id}`;
      socket.join(room);
      console.log(`Client ${socket.id} joined inbox: ${normalizedAddress}`);
      acknowledge?.({ success: true, room });
    });

    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  
})
return io;
};