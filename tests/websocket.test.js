import { afterEach, describe, expect, it, vi } from "vitest";
import http from "node:http";
import { io as createClient } from "socket.io-client";

vi.mock("../src/lib/inboxAccess.js", () => ({
  verifyInboxAccess: vi.fn(),
}));

const { initWebSocket, publishNewMessage } = await import(
  "../src/configs/websocket.js"
);

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

function waitForLeave(socket, inboxId) {
  return new Promise((resolve, reject) => {
    socket.emit("leave-inbox", { inboxId }, (response) => {
      if (!response?.success) {
        reject(new Error(response?.error ?? "Leave failed"));
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

    if (address === "first@temp.com") return { id: "inbox-1" };
    if (address === "second@temp.com") return { id: "inbox-2" };
    if (address === "third@temp.com") return { id: "inbox-3" };
    return null;
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

describe("WebSocket Real-Time Message Push & Multi-Inbox Support", () => {
  it("delivers an enriched message payload only to the matching inbox within three seconds", async () => {
    const { io, port, accessChecker } = await createTestServer();
    const clientA = createClient(`http://localhost:${port}`, {
      transports: ["websocket"],
    });
    const clientB = createClient(`http://localhost:${port}`, {
      transports: ["websocket"],
    });
    activeClients.push(clientA, clientB);

    await Promise.all([waitForConnection(clientA), waitForConnection(clientB)]);

    await expect(
      waitForSubscription(clientA, "FIRST@TEMP.COM", "valid-token")
    ).resolves.toEqual({
      success: true,
      room: "inbox:inbox-1",
    });

    await expect(
      waitForSubscription(clientB, "second@temp.com", "valid-token")
    ).resolves.toEqual({
      success: true,
      room: "inbox:inbox-2",
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
      toAddress: "first@temp.com",
      fromAddress: "sender@example.com",
      subject: "Verification code",
      receivedAt: new Date().toISOString(),
    });

    await expect(clientAMessage).resolves.toMatchObject({
      id: "message-1",
      inboxId: "inbox-1",
      toAddress: "first@temp.com",
      fromAddress: "sender@example.com",
      subject: "Verification code",
    });

    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(clientBReceivedMessage).toBe(false);
  });

  it("allows a single client to subscribe to multiple inboxes and receive messages for both", async () => {
    const { io, port } = await createTestServer();
    const client = createClient(`http://localhost:${port}`, {
      transports: ["websocket"],
    });
    const isolatedClient = createClient(`http://localhost:${port}`, {
      transports: ["websocket"],
    });
    activeClients.push(client, isolatedClient);

    await Promise.all([waitForConnection(client), waitForConnection(isolatedClient)]);

    // Client subscribes to inbox-1 AND inbox-2
    await waitForSubscription(client, "first@temp.com", "valid-token");
    await waitForSubscription(client, "second@temp.com", "valid-token");

    // Isolated client subscribes only to inbox-3
    await waitForSubscription(isolatedClient, "third@temp.com", "valid-token");

    const receivedMessages = [];
    client.on("message:new", (msg) => receivedMessages.push(msg));

    let isolatedReceived = false;
    isolatedClient.on("message:new", () => {
      isolatedReceived = true;
    });

    // Publish to inbox-1
    publishNewMessage(io, "inbox-1", {
      id: "msg-inbox-1",
      toAddress: "first@temp.com",
      fromAddress: "alice@test.com",
      subject: "Hello Inbox 1",
      receivedAt: new Date().toISOString(),
    });

    // Publish to inbox-2 (the unfocused inbox for the same client!)
    publishNewMessage(io, "inbox-2", {
      id: "msg-inbox-2",
      toAddress: "second@temp.com",
      fromAddress: "bob@test.com",
      subject: "Hello Inbox 2",
      receivedAt: new Date().toISOString(),
    });

    // Wait briefly for both pushes to arrive
    await new Promise((resolve) => setTimeout(resolve, 80));

    expect(receivedMessages).toHaveLength(2);
    expect(receivedMessages[0]).toMatchObject({
      id: "msg-inbox-1",
      inboxId: "inbox-1",
      toAddress: "first@temp.com",
    });
    expect(receivedMessages[1]).toMatchObject({
      id: "msg-inbox-2",
      inboxId: "inbox-2",
      toAddress: "second@temp.com",
    });

    // Isolated client should not have received either message
    expect(isolatedReceived).toBe(false);
  });

  it("allows a client to explicitly leave an inbox room", async () => {
    const { io, port } = await createTestServer();
    const client = createClient(`http://localhost:${port}`, {
      transports: ["websocket"],
    });
    activeClients.push(client);

    await waitForConnection(client);

    // Subscribe to two inboxes
    await waitForSubscription(client, "first@temp.com", "valid-token");
    await waitForSubscription(client, "second@temp.com", "valid-token");

    // Leave inbox-1
    await expect(waitForLeave(client, "inbox-1")).resolves.toEqual({
      success: true,
      room: "inbox:inbox-1",
    });

    let receivedMsg = null;
    client.on("message:new", (msg) => {
      receivedMsg = msg;
    });

    // Publish to inbox-1 (already left)
    publishNewMessage(io, "inbox-1", {
      id: "msg-dropped",
      toAddress: "first@temp.com",
      fromAddress: "test@test.com",
      subject: "Should not receive",
      receivedAt: new Date().toISOString(),
    });

    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(receivedMsg).toBeNull();

    // Publish to inbox-2 (still joined)
    publishNewMessage(io, "inbox-2", {
      id: "msg-kept",
      toAddress: "second@temp.com",
      fromAddress: "test@test.com",
      subject: "Should receive",
      receivedAt: new Date().toISOString(),
    });

    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(receivedMsg).toMatchObject({
      id: "msg-kept",
      inboxId: "inbox-2",
    });
  });

  it("rejects an invalid token without joining a room", async () => {
    const { port } = await createTestServer();
    const client = createClient(`http://localhost:${port}`, {
      transports: ["websocket"],
    });
    activeClients.push(client);

    await waitForConnection(client);

    await expect(
      waitForSubscription(client, "first@temp.com", "wrong-token")
    ).rejects.toThrow("invalid or expired inbox credentials");
  });

  it("handles client disconnect cleanly", async () => {
    const { port } = await createTestServer();
    const client = createClient(`http://localhost:${port}`, {
      transports: ["websocket"],
    });
    activeClients.push(client);

    await waitForConnection(client);
    client.disconnect();

    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(client.connected).toBe(false);
  });
});
