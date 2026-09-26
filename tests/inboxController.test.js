import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  prismaMock,
  generateTokenMock,
  hashTokenMock,
  generateAddressMock,
} = vi.hoisted(() => ({
  prismaMock: {
    inbox: {
      create: vi.fn(),
    },
  },
  generateTokenMock: vi.fn(),
  hashTokenMock: vi.fn((token) => `${token}-hash`),
  generateAddressMock: vi.fn(),
}));

vi.mock("../src/configs/prisma.js", () => ({
  default: prismaMock,
}));

vi.mock("../src/utils/generateToken.js", () => ({
  generateToken: generateTokenMock,
  hashToken: hashTokenMock,
}));

vi.mock("../src/lib/addressGenerator.js", () => ({
  generateAddress: generateAddressMock,
}));

process.env.DOMAIN_ADDRESS ??= "inbound.example.test";
const { createInbox } = await import("../src/api/v1/controllers/inboxController.js");

const createResponse = () => ({
  status: vi.fn().mockReturnThis(),
  json: vi.fn().mockReturnThis(),
});

beforeEach(() => {
  vi.clearAllMocks();
});

describe("createInbox", () => {
  it("creates a session and inbox and returns both tokens", async () => {
    const expiresAt = new Date("2026-09-27T00:00:00.000Z");
    generateTokenMock
      .mockReturnValueOnce("inbox-token")
      .mockReturnValueOnce("session-token");
    generateAddressMock.mockReturnValue({
      localPart: "generated",
      address: "generated@inbound.example.test",
    });
    prismaMock.inbox.create.mockResolvedValue({
      id: "inbox-123",
      address: "generated@inbound.example.test",
      expiresAt,
    });

    const req = {};
    const res = createResponse();

    await createInbox(req, res);

    expect(prismaMock.inbox.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        address: "generated@inbound.example.test",
        localPart: "generated",
        domain: "inbound.example.test",
        tokenHash: "inbox-token-hash",
        session: {
          create: {
            tokenHash: "session-token-hash",
          },
        },
      }),
    });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: {
        id: "inbox-123",
        address: "generated@inbound.example.test",
        token: "inbox-token",
        session: {
          token: "session-token",
        },
        expiresAt,
      },
    });
  });
});