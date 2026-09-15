import { Server } from 'socket.io';
import { verifyInboxAccess } from '../lib/inboxAccess.js';

export const initWebSocket = (server, checkInboxAccess = verifyInboxAccess) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_ORIGIN || "*",
      methods: ["GET", "POST"]
    }
  });

  io.on('connection', (socket) => {
    console.log(`New client connected: ${socket.id}`);

    // Verify the inbox token before allowing the client into its room.
    socket.on('join-inbox', async (payload = {}, acknowledge) => {
      const { address, token } = payload ?? {};

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
      for (const existingRoom of socket.rooms) {
        if (existingRoom.startsWith('inbox:')) {
          socket.leave(existingRoom);
        }
      }
      socket.join(room);
      console.log(`Client ${socket.id} joined inbox: ${normalizedAddress}`);
      acknowledge?.({ success: true, room });
    });

    // Socket.IO removes the client's rooms when it disconnects.
    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });

  return io;
};
