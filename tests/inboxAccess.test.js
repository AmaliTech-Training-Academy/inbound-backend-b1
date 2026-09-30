import { beforeEach, describe, expect, it, vi } from "vitest";

const { prismaMock, hashTokenMock } = vi.hoisted(() => ({
  prismaMock: {
    inbox: {
      findUnique: vi.fn(),
    },
  },
  hashTokenMock: vi.fn((token) => `hash-${token}`),
}));

vi.mock("../src/configs/prisma.js", () => ({
  default: prismaMock,
}));

vi.mock("../src/utils/generateToken.js", () => ({
  hashToken: hashTokenMock,
}));

import { verifyInboxAccess } from "../src/lib/inboxAccess.js";

describe("verifyInboxAccess", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const validFutureDate = new Date(Date.now() + 60 * 60 * 1000);
  const pastDate = new Date(Date.now() - 60 * 60 * 1000);

  it("returns inbox when address and session token match and are active", async () => {
    const rawToken = "my-secret-token";
    const hashedHex = Buffer.from("hash-my-secret-token").toString("hex");
    hashTokenMock.mockReturnValue(hashedHex);

    const mockInbox = {
      id: "inbox-123",
      address: "test@inbound.com",
      isDeleted: false,
      expiresAt: validFutureDate,
      session: {
        id: "session-123",
        tokenHash: hashedHex,
        expiresAt: validFutureDate,
      },
    };

    prismaMock.inbox.findUnique.mockResolvedValue(mockInbox);

    const result = await verifyInboxAccess("TEST@INBOUND.COM", rawToken);

    expect(prismaMock.inbox.findUnique).toHaveBeenCalledWith({
      where: { address: "test@inbound.com" },
      include: { session: true },
    });
    expect(result).toEqual(mockInbox);
  });

  it("returns null if address or token are empty or invalid types", async () => {
    expect(await verifyInboxAccess("", "token")).toBeNull();
    expect(await verifyInboxAccess("address@test.com", "")).toBeNull();
    expect(await verifyInboxAccess(null, "token")).toBeNull();
    expect(await verifyInboxAccess("address@test.com", undefined)).toBeNull();
  });

  it("returns null if inbox is not found", async () => {
    prismaMock.inbox.findUnique.mockResolvedValue(null);

    const result = await verifyInboxAccess("unknown@inbound.com", "token");
    expect(result).toBeNull();
  });

  it("returns null if inbox is marked as deleted", async () => {
    prismaMock.inbox.findUnique.mockResolvedValue({
      id: "inbox-123",
      address: "test@inbound.com",
      isDeleted: true,
      expiresAt: validFutureDate,
      session: {
        tokenHash: Buffer.from("hash-token").toString("hex"),
        expiresAt: validFutureDate,
      },
    });

    const result = await verifyInboxAccess("test@inbound.com", "token");
    expect(result).toBeNull();
  });

  it("returns null if inbox is expired", async () => {
    prismaMock.inbox.findUnique.mockResolvedValue({
      id: "inbox-123",
      address: "test@inbound.com",
      isDeleted: false,
      expiresAt: pastDate,
      session: {
        tokenHash: Buffer.from("hash-token").toString("hex"),
        expiresAt: validFutureDate,
      },
    });

    const result = await verifyInboxAccess("test@inbound.com", "token");
    expect(result).toBeNull();
  });

  it("returns null if parent session is expired", async () => {
    prismaMock.inbox.findUnique.mockResolvedValue({
      id: "inbox-123",
      address: "test@inbound.com",
      isDeleted: false,
      expiresAt: validFutureDate,
      session: {
        tokenHash: Buffer.from("hash-token").toString("hex"),
        expiresAt: pastDate,
      },
    });

    const result = await verifyInboxAccess("test@inbound.com", "token");
    expect(result).toBeNull();
  });

  it("returns null if token does not match session tokenHash", async () => {
    const providedHex = Buffer.from("hash-wrong-token").toString("hex");
    const storedHex = Buffer.from("hash-correct-token").toString("hex");
    hashTokenMock.mockReturnValue(providedHex);

    prismaMock.inbox.findUnique.mockResolvedValue({
      id: "inbox-123",
      address: "test@inbound.com",
      isDeleted: false,
      expiresAt: validFutureDate,
      session: {
        tokenHash: storedHex,
        expiresAt: validFutureDate,
      },
    });

    const result = await verifyInboxAccess("test@inbound.com", "wrong-token");
    expect(result).toBeNull();
  });
});
