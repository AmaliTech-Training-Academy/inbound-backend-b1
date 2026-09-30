import { Server } from 'socket.io';
import { verifyInboxAccess } from '../lib/inboxAccess.js';

// Send each message only to clients subscribed to its inbox
export function publishNewMessage(io, inboxId, message) {
  io.to(`inbox:${inboxId}`).emit('message:new', {
    id: message.id,
    inboxId: inboxId,
    toAddress: message.toAddress,
    fromAddress: message.fromAddress,
    subject: message.subject,
    receivedAt: message.receivedAt
  });
}

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
      socket.join(room);
      console.log(`Client ${socket.id} joined inbox: ${normalizedAddress} (${room})`);
      acknowledge?.({ success: true, room });
    });

    // Explicitly unsubscribe from an inbox room without terminating the socket
    socket.on('leave-inbox', (payload = {}, acknowledge) => {
      const { inboxId } = payload ?? {};

      if (typeof inboxId !== 'string' || !inboxId.trim()) {
        acknowledge?.({ success: false, error: 'inboxId is required' });
        return;
      }

      const room = `inbox:${inboxId.trim()}`;
      socket.leave(room);
      console.log(`Client ${socket.id} left inbox room: ${room}`);
      acknowledge?.({ success: true, room });
    });

    // Socket.IO removes all of the client's rooms when it disconnects.
    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });

  return io;
};
