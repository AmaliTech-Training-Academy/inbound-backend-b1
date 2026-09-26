import { beforeEach, describe, expect, it, vi } from "vitest";

const { prismaMock, hashTokenMock } = vi.hoisted(() => ({
  prismaMock: {
    inbox: {
      findUnique: vi.fn(),
    },
  },
  hashTokenMock: vi.fn(() => "hashed-token"),
}));

vi.mock("../src/configs/prisma.js", () => ({
  default: prismaMock,
}));

vi.mock("../src/utils/generateToken.js", () => ({
  hashToken: hashTokenMock,
}));

import { requireInboxAccess } from "../src/middlewares/requireInboxAccess.js";

const createResponse = () => ({
  status: vi.fn().mockReturnThis(),
  json: vi.fn().mockReturnThis(),
});

beforeEach(() => {
  vi.clearAllMocks();
  hashTokenMock.mockReturnValue("hashed-token");
});

describe("requireInboxAccess", () => {
  it("rejects a request when the attached session has expired", async () => {
    prismaMock.inbox.findUnique.mockResolvedValue({
      expiresAt: new Date("2099-01-01T00:00:00.000Z"),
      session: {
        expiresAt: new Date("2000-01-01T00:00:00.000Z"),
      },
    });
    const req = { headers: { authorization: "Bearer inbox-token" } };
    const res = createResponse();
    const next = vi.fn();

    await requireInboxAccess(req, res, next);

    expect(res.status).toHaveBeenCalledWith(410);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Session has expired",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("attaches the active session and continues", async () => {
    const session = {
      id: "session-123",
      createdAt: new Date("2026-09-26T00:00:00.000Z"),
      expiresAt: new Date("2099-01-01T00:00:00.000Z"),
      lastExtendedAt: null,
    };
    prismaMock.inbox.findUnique.mockResolvedValue({
      expiresAt: new Date("2099-01-01T00:00:00.000Z"),
      session,
    });
    const req = { headers: { authorization: "Bearer inbox-token" } };
    const res = createResponse();
    const next = vi.fn();

    await requireInboxAccess(req, res, next);

    expect(req.token).toBe("inbox-token");
    expect(req.session).toBe(session);
    expect(next).toHaveBeenCalledOnce();
  });
});
