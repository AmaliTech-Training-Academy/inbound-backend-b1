import { afterEach, describe, expect, it, vi } from "vitest";
import http from "node:http";
import express from "express";
import multer from "multer";
import { io as createClient } from "socket.io-client";

vi.mock("../src/lib/inboxAccess.js", () => ({
  verifyInboxAccess: vi.fn(async (address, token) => {
    if (address === "target@inbound.com" && token === "valid-token") {
      return { id: "inbox-target", address: "target@inbound.com" };
    }
    if (address === "other@inbound.com" && token === "valid-token") {
      return { id: "inbox-other", address: "other@inbound.com" };
    }
    return null;
  }),
}));

const mockIngestMailgunMessage = vi.fn();
vi.mock("../src/api/v1/services/mailIngestionService.js", () => ({
  ingestMailgunMessage: (...args) => mockIngestMailgunMessage(...args),
  PermanentIngestionError: class PermanentIngestionError extends Error {},
}));

const { initWebSocket } = await import("../src/configs/websocket.js");
const { createMailgunWebhookController } = await import(
  "../src/api/v1/controllers/mailgunWebhookController.js"
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

function waitForMessage(socket, timeoutMs = 3000) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error("Timed out waiting for message:new"));
    }, timeoutMs);

    socket.once("message:new", (msg) => {
      clearTimeout(timer);
      resolve(msg);
    });
  });
}

async function createE2ETestApp() {
  const app = express();
  const server = http.createServer(app);
  const io = initWebSocket(server);
  app.set("io", io);

  const upload = multer();
  const webhookHandler = createMailgunWebhookController({ prisma: {} });

  app.post("/api/v1/webhooks/mailgun/raw-mime", upload.any(), webhookHandler);

  await new Promise((resolve) => server.listen(0, resolve));
  activeServers.push({ server, io });

  const { port } = server.address();
  const url = `http://localhost:${port}`;
  return { app, server, io, port, url };
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
  vi.clearAllMocks();
});

describe("End-to-End Mailgun Ingestion to WebSocket Push", () => {
  it("pushes a real-time message event to subscribed WebSocket client when Mailgun webhook is received", async () => {
    const { url, port } = await createE2ETestApp();

    // 1. Connect WebSocket client A and subscribe to target@inbound.com
    const clientA = createClient(`http://localhost:${port}`, {
      transports: ["websocket"],
    });
    // 2. Connect WebSocket client B and subscribe to other@inbound.com
    const clientB = createClient(`http://localhost:${port}`, {
      transports: ["websocket"],
    });
    activeClients.push(clientA, clientB);

    await Promise.all([waitForConnection(clientA), waitForConnection(clientB)]);

    await waitForSubscription(clientA, "target@inbound.com", "valid-token");
    await waitForSubscription(clientB, "other@inbound.com", "valid-token");

    // Mock successful email ingestion
    const ingestedMessage = {
      id: "msg-uuid-9999",
      inboxId: "inbox-target",
      toAddress: "target@inbound.com",
      fromAddress: "newsletter@service.com",
      subject: "Your Weekly Digest",
      receivedAt: new Date().toISOString(),
    };

    mockIngestMailgunMessage.mockResolvedValue({
      duplicate: false,
      message: ingestedMessage,
    });

    const clientAMessagePromise = waitForMessage(clientA);
    let clientBReceived = false;
    clientB.once("message:new", () => {
      clientBReceived = true;
    });

    // 3. Post simulated webhook multipart payload to the HTTP endpoint
    const form = new FormData();
    form.append("recipient", "target@inbound.com");
    form.append("sender", "newsletter@service.com");
    form.append("from", "Newsletter <newsletter@service.com>");
    form.append("subject", "Your Weekly Digest");
    form.append(
      "body-mime",
      new Blob(["From: newsletter@service.com\r\nTo: target@inbound.com\r\n\r\nHello!"], {
        type: "message/rfc822",
      }),
      "email.eml"
    );

    const httpResponse = await fetch(`${url}/api/v1/webhooks/mailgun/raw-mime`, {
      method: "POST",
      body: form,
    });

    // Verify HTTP response from Mailgun controller
    expect(httpResponse.status).toBe(202);
    const responseJson = await httpResponse.json();
    expect(responseJson).toEqual({
      success: true,
      duplicate: false,
      messageId: "msg-uuid-9999",
    });

    // 4. Verify WebSocket push was received by client A with enriched fields
    const receivedEvent = await clientAMessagePromise;
    expect(receivedEvent).toMatchObject({
      id: "msg-uuid-9999",
      inboxId: "inbox-target",
      toAddress: "target@inbound.com",
      fromAddress: "newsletter@service.com",
      subject: "Your Weekly Digest",
    });

    // 5. Verify client B (listening to other@inbound.com) never received the event
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(clientBReceived).toBe(false);
  });
});
