import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const {
  prismaMock,
  generateTokenMock,
  hashTokenMock,
  generateAddressMock,
  getCustomDomainAddressMock,
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
  // Mirrors the real helper's (domain, localPart) signature.
  getCustomDomainAddressMock: vi.fn((domain, localPart) => ({
    localPart,
    address: `${localPart}@${domain}`,
  })),
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
  getCustomDomainAddress: getCustomDomainAddressMock,
}));

process.env.DOMAIN_ADDRESS ??= "inbound.example.test";
const { createInbox, extendInboxTime, generateCustomInbox } = await import(
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

describe("generateCustomInbox", () => {
  const createRequest = (localPart, headers) => ({
    body: { localPart },
    ...(headers ? { headers } : {}),
  });

  it("creates an inbox at the requested address", async () => {
    generateTokenMock.mockReturnValueOnce("session-token");
    prismaMock.inbox.create.mockImplementation(async ({ data }) => ({
      id: "inbox-123",
      address: data.address,
      expiresAt: data.expiresAt,
    }));

    const res = createResponse();

    await generateCustomInbox(createRequest("mycustominbox"), res);

    expect(getCustomDomainAddressMock).toHaveBeenCalledWith(
      "inbound.example.test",
      "mycustominbox",
    );
    expect(prismaMock.inbox.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        address: "mycustominbox@inbound.example.test",
        localPart: "mycustominbox",
        domain: "inbound.example.test",
      }),
    });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: true,
      data: expect.objectContaining({
        address: "mycustominbox@inbound.example.test",
        id: "inbox-123",
      }),
    }));
  });

  it("does not retry the create when the address is already taken", async () => {
    prismaMock.inbox.create.mockRejectedValue(
      Object.assign(new Error("unique"), {
        code: "P2002",
        meta: { target: ["address"] },
      }),
    );

    const res = createResponse();

    await generateCustomInbox(createRequest("taken"), res);

    expect(prismaMock.inbox.create).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Inbox with this localPart already exists.",
    });
  });

  it.each([
    ["a non-string", 42],
    ["an empty string", ""],
    ["non-alphanumeric characters", "not valid!"],
    ["a dotted local part", "first.last"],
    ["a local part longer than 64 characters", "a".repeat(65)],
  ])("rejects %s with a 400", async (_label, localPart) => {
    const res = createResponse();

    await generateCustomInbox(createRequest(localPart), res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(prismaMock.inbox.create).not.toHaveBeenCalled();
    expect(prismaMock.session.findUnique).not.toHaveBeenCalled();
  });

  it("rejects a request with no body", async () => {
    const res = createResponse();

    await generateCustomInbox({}, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(prismaMock.inbox.create).not.toHaveBeenCalled();
  });

  it("returns not found when the provided session token is unknown", async () => {
    prismaMock.session.findUnique.mockResolvedValue(null);

    const res = createResponse();

    await generateCustomInbox(
      createRequest("mycustominbox", {
        authorization: "Bearer unknown-session-token",
      }),
      res,
    );

    expect(res.status).toHaveBeenCalledWith(404);
    expect(prismaMock.inbox.create).not.toHaveBeenCalled();
  });

  it("joins a live session when its bearer token is supplied", async () => {
    const sessionExpiresAt = new Date(Date.now() + 60 * 1000);
    prismaMock.session.findUnique.mockResolvedValue({
      id: "session-123",
      expiresAt: sessionExpiresAt,
    });
    prismaMock.inbox.create.mockImplementation(async ({ data }) => ({
      id: "inbox-123",
      address: data.address,
      expiresAt: data.expiresAt,
    }));

    const res = createResponse();

    await generateCustomInbox(
      createRequest("mycustominbox", {
        authorization: "Bearer live-session-token",
      }),
      res,
    );

    expect(prismaMock.inbox.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        session: { connect: { id: "session-123" } },
      }),
    });
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it("reports a 500 instead of leaving the request hanging", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    prismaMock.inbox.create.mockRejectedValue(new Error("database is down"));

    const res = createResponse();

    await generateCustomInbox(createRequest("mycustominbox"), res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Internal Server Error",
    });

    consoleError.mockRestore();
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