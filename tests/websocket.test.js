import { afterEach, describe, expect, it, vi } from "vitest";
import http from "node:http";
import { io as createClient } from "socket.io-client";

vi.mock("../src/lib/inboxAccess.js", () => ({
  verifyInboxAccess: vi.fn()
}));

const { initWebSocket, publishNewMessage } = await import("../src/configs/websocket.js");

const activeServers = [];
const activeClients = [];

function waitForConnection(socket) {
  return new Promise((resolve, reject) => {
    socket.once("connect", resolve);
    socket.once("connect_error", reject);
  });
}

function waitForSubscription(socket, address, token) {
  return new Promise((resolve, reject) => {
    socket.emit("join-inbox", { address, token }, (response) => {
      if (!response?.success) {
        reject(new Error(response?.error ?? "Subscription failed"));
        return;
      }

      resolve(response);
    });
  });
}

function waitForMessage(socket, timeoutMs = 3000) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error("Timed out waiting for message:new"));
    }, timeoutMs);

    socket.once("message:new", (message) => {
      clearTimeout(timeout);
      resolve(message);
    });
  });
}

async function createTestServer() {
  const server = http.createServer();
  const accessChecker = vi.fn(async (address, token) => {
    if (token !== "valid-token") {
      return null;
    }

    return {
      id: address === "first@temp.com" ? "inbox-1" : "inbox-2"
    };
  });
  const io = initWebSocket(server, accessChecker);

  await new Promise((resolve) => server.listen(0, resolve));
  activeServers.push({ server, io });

  const { port } = server.address();
  return { io, port, accessChecker };
}

afterEach(async () => {
  for (const client of activeClients.splice(0)) {
    client.close();
  }

  await Promise.all(
    activeServers.splice(0).map(({ server, io }) => {
      io.close();
      return new Promise((resolve) => server.close(resolve));
    })
  );
});

describe("WebSocket inbox delivery", () => {
  it("delivers a new message only to the matching inbox within three seconds", async () => {
    const { io, port, accessChecker } = await createTestServer();
    const clientA = createClient(`http://localhost:${port}`, {
      transports: ["websocket"]
    });
    const clientB = createClient(`http://localhost:${port}`, {
      transports: ["websocket"]
    });
    activeClients.push(clientA, clientB);

    await Promise.all([waitForConnection(clientA), waitForConnection(clientB)]);

    await expect(
      waitForSubscription(clientA, "FIRST@TEMP.COM", "valid-token")
    ).resolves.toEqual({
      success: true,
      room: "inbox:inbox-1"
    });
    await expect(
      waitForSubscription(clientB, "second@temp.com", "valid-token")
    ).resolves.toEqual({
      success: true,
      room: "inbox:inbox-2"
    });

    expect(accessChecker).toHaveBeenNthCalledWith(
      1,
      "first@temp.com",
      "valid-token"
    );

    const clientAMessage = waitForMessage(clientA);
    let clientBReceivedMessage = false;
    clientB.once("message:new", () => {
      clientBReceivedMessage = true;
    });

    publishNewMessage(io, "inbox-1", {
      id: "message-1",
      fromAddress: "sender@example.com",
      subject: "Verification code",
      receivedAt: new Date().toISOString()
    });

    await expect(clientAMessage).resolves.toMatchObject({
      id: "message-1",
      fromAddress: "sender@example.com",
      subject: "Verification code"
    });

    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(clientBReceivedMessage).toBe(false);
  });

  it("rejects an invalid token without joining a room", async () => {
    const { port } = await createTestServer();
    const client = createClient(`http://localhost:${port}`, {
      transports: ["websocket"]
    });
    activeClients.push(client);

    await waitForConnection(client);

    await expect(
      waitForSubscription(client, "first@temp.com", "wrong-token")
    ).rejects.toThrow("invalid or expired inbox credentials");
  });
});
