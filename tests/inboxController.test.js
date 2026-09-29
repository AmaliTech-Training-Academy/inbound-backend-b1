import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const {
  prismaMock,
  generateTokenMock,
  hashTokenMock,
  generateAddressMock,
} = vi.hoisted(() => ({
  prismaMock: {
    inbox: {
      create: vi.fn(),
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    session: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    $transaction: vi.fn(),
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
const { createInbox, extendInboxTime } = await import(
  "../src/api/v1/controllers/inboxController.js"
);

const createResponse = () => ({
  status: vi.fn().mockReturnThis(),
  json: vi.fn().mockReturnThis(),
});

beforeEach(() => {
  vi.clearAllMocks();
  prismaMock.$transaction.mockImplementation((callback) =>
    callback({
      inbox: {
        create: prismaMock.inbox.create,
        update: prismaMock.inbox.update,
      },
      session: { update: prismaMock.session.update },
    }),
  );
});

afterEach(() => {
  vi.useRealTimers();
});

describe("createInbox", () => {
  it("creates a session and inbox and returns both tokens", async () => {
    generateTokenMock.mockReturnValueOnce("session-token");
    generateAddressMock.mockReturnValue({
      localPart: "generated",
      address: "generated@inbound.example.test",
    });
    prismaMock.inbox.create.mockImplementation(async ({ data }) => ({
      id: "inbox-123",
      address: data.address,
      expiresAt: data.expiresAt,
    }));

    const req = {};
    const res = createResponse();

    await createInbox(req, res);

    expect(prismaMock.inbox.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        address: "generated@inbound.example.test",
        localPart: "generated",
        domain: "inbound.example.test",
        session: {
          create: {
            tokenHash: "session-token-hash",
            expiresAt: expect.any(Date),
          },
        },
        expiresAt: expect.any(Date),
      }),
    });
    const createData = prismaMock.inbox.create.mock.calls[0][0].data;
    expect(createData.session.create.expiresAt).toEqual(createData.expiresAt);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: true,
      data: expect.objectContaining({
        address: "generated@inbound.example.test",
        id: "inbox-123",
        session: {
          token: "session-token",
          expiresAt: createData.expiresAt,
        },
        expiresAt: createData.expiresAt,
      }),
    }));
  });

  it("adds an inbox to a provided session that has not expired", async () => {
    const sessionExpiresAt = new Date(Date.now() + 60 * 1000);
    generateAddressMock.mockReturnValue({
      localPart: "generated",
      address: "generated@inbound.example.test",
    });
    prismaMock.session.findUnique.mockResolvedValue({
      id: "session-123",
      expiresAt: sessionExpiresAt,
    });
    prismaMock.inbox.create.mockImplementation(async ({ data }) => ({
      address: data.address,
      expiresAt: data.expiresAt,
    }));

    const req = { headers: { authorization: "Bearer existing-session-token" } };
    const res = createResponse();

    await createInbox(req, res);

    expect(prismaMock.session.findUnique).toHaveBeenCalledWith({
      where: { tokenHash: "existing-session-token-hash" },
    });
    expect(prismaMock.inbox.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        session: { connect: { id: "session-123" } },
      }),
    });
    const inboxExpiresAt = prismaMock.inbox.create.mock.calls[0][0].data.expiresAt;
    expect(prismaMock.session.update).toHaveBeenCalledWith({
      where: { id: "session-123" },
      data: { expiresAt: inboxExpiresAt },
    });
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        session: {
          token: "existing-session-token",
          expiresAt: inboxExpiresAt,
        },
      }),
    }));
  });

  it("returns not found when the provided session token is unknown", async () => {
    prismaMock.session.findUnique.mockResolvedValue(null);

    const req = { headers: { authorization: "Bearer unknown-session-token" } };
    const res = createResponse();

    await createInbox(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Session Not Found",
    });
    expect(prismaMock.inbox.create).not.toHaveBeenCalled();
    expect(generateTokenMock).not.toHaveBeenCalled();
  });

  it("creates a new session when the provided session has expired", async () => {
    generateTokenMock.mockReturnValueOnce("new-session-token");
    generateAddressMock.mockReturnValue({
      localPart: "generated",
      address: "generated@inbound.example.test",
    });
    prismaMock.session.findUnique.mockResolvedValue({
      id: "expired-session-123",
      expiresAt: new Date(0),
    });
    prismaMock.inbox.create.mockImplementation(async ({ data }) => ({
      address: data.address,
      expiresAt: data.expiresAt,
    }));

    const req = { headers: { authorization: "Bearer expired-session-token" } };
    const res = createResponse();

    await createInbox(req, res);

    expect(prismaMock.inbox.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        session: {
          create: {
            tokenHash: "new-session-token-hash",
            expiresAt: expect.any(Date),
          },
        },
      }),
    });
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        session: expect.objectContaining({ token: "new-session-token" }),
      }),
    }));
  });

  it("does not reuse a session object without its bearer token", async () => {
    generateTokenMock.mockReturnValueOnce("new-session-token");
    generateAddressMock.mockReturnValue({
      localPart: "generated",
      address: "generated@inbound.example.test",
    });
    prismaMock.inbox.create.mockImplementation(async ({ data }) => ({
      address: data.address,
      expiresAt: data.expiresAt,
    }));

    const req = {
      session: {
        id: "session-from-middleware",
        token: "session-token-from-middleware",
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      },
    };
    const res = createResponse();

    await createInbox(req, res);

    expect(prismaMock.session.findUnique).not.toHaveBeenCalled();
    expect(prismaMock.inbox.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        session: {
          create: {
            tokenHash: "new-session-token-hash",
            expiresAt: expect.any(Date),
          },
        },
      }),
    });
  });
});

describe("extendInboxTime", () => {
  it("extends the inbox and its parent session together", async () => {
    const now = new Date("2026-09-27T21:32:00.000Z");
    const oldExpiresAt = new Date("2026-09-27T21:37:00.000Z");
    const newExpiresAt = new Date("2026-09-27T21:42:00.000Z");
    vi.useFakeTimers();
    vi.setSystemTime(now);
    prismaMock.inbox.findFirst.mockResolvedValue({
      id: "inbox-123",
      sessionId: "session-123",
      expiresAt: oldExpiresAt,
      isDeleted: false,
      session: {
        expiresAt: oldExpiresAt,
      },
    });
    prismaMock.inbox.update.mockResolvedValue({
      expiresAt: newExpiresAt,
      lastExtendedAt: now,
      extendCount: 1,
    });

    const req = {
      params: { id: "inbox-123" },
      session: { id: "session-123" },
    };
    const res = createResponse();

    await extendInboxTime(req, res);

    expect(prismaMock.inbox.findFirst).toHaveBeenCalledWith({
      where: { id: "inbox-123", sessionId: "session-123" },
      include: {
        session: {
          select: {
            expiresAt: true,
          },
        },
      },
    });
    expect(prismaMock.inbox.update).toHaveBeenCalledWith({
      where: { id: "inbox-123" },
      data: {
        expiresAt: newExpiresAt,
        lastExtendedAt: now,
        extendCount: { increment: 1 },
      },
    });
    expect(prismaMock.session.update).toHaveBeenCalledWith({
      where: { id: "session-123" },
      data: {
        expiresAt: newExpiresAt,
        lastExtendedAt: now,
      },
    });
    expect(res.status).toHaveBeenCalledWith(200);
  });
});