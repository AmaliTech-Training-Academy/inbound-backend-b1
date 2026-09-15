import { afterEach, describe, expect, it, vi } from "vitest";
import http from "node:http";
import { io as createClient } from "socket.io-client";

vi.mock("../src/lib/inboxAccess.js", () => ({
  verifyInboxAccess: vi.fn()
}));

const { initWebSocket } = await import("../src/configs/websocket.js");

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

describe("WebSocket Connection & Inbox Authentication", () => {
  it("connects and successfully joins an inbox room with valid credentials", async () => {
    const { port, accessChecker } = await createTestServer();
    const client = createClient(`http://localhost:${port}`, {
      transports: ["websocket"]
    });
    activeClients.push(client);

    await waitForConnection(client);

    await expect(
      waitForSubscription(client, "FIRST@TEMP.COM", "valid-token")
    ).resolves.toEqual({
      success: true,
      room: "inbox:inbox-1"
    });

    expect(accessChecker).toHaveBeenCalledWith("first@temp.com", "valid-token");
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

  it("handles client disconnect cleanly", async () => {
    const { port } = await createTestServer();
    const client = createClient(`http://localhost:${port}`, {
      transports: ["websocket"]
    });
    activeClients.push(client);

    await waitForConnection(client);
    client.disconnect();

    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(client.connected).toBe(false);
  });
});
