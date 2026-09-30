import { beforeEach, describe, expect, it, vi } from "vitest";

const { prismaMock, hashTokenMock } = vi.hoisted(() => ({
  prismaMock: {
    session: {
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
  it("rejects a request when the session token has expired", async () => {
    prismaMock.session.findUnique.mockResolvedValue({
      expiresAt: new Date("2000-01-01T00:00:00.000Z"),
    });
    const req = { headers: { authorization: "Bearer session-token" } };
    const res = createResponse();
    const next = vi.fn();

    await requireInboxAccess(req, res, next);

    expect(res.status).toHaveBeenCalledWith(410);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Session Expired",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("authenticates with the session token and continues", async () => {
    const session = {
      id: "session-123",
      createdAt: new Date("2026-09-26T00:00:00.000Z"),
      expiresAt: new Date("2099-01-01T00:00:00.000Z"),
      lastExtendedAt: null,
    };
    prismaMock.session.findUnique.mockResolvedValue(session);
    const req = { headers: { authorization: "Bearer session-token" } };
    const res = createResponse();
    const next = vi.fn();

    await requireInboxAccess(req, res, next);

    expect(req.session).toEqual({ ...session, token: "session-token" });
    expect(next).toHaveBeenCalledOnce();
  });

  it("selects the session id that controllers use to scope queries", async () => {
    prismaMock.session.findUnique.mockResolvedValue({
      id: "session-123",
      expiresAt: new Date("2099-01-01T00:00:00.000Z"),
    });
    const req = { headers: { authorization: "Bearer session-token" } };

    await requireInboxAccess(req, createResponse(), vi.fn());

    expect(prismaMock.session.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { tokenHash: "hashed-token" },
        select: expect.objectContaining({ id: true }),
      }),
    );
  });

  it("fails closed when the session record has no id", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    prismaMock.session.findUnique.mockResolvedValue({
      expiresAt: new Date("2099-01-01T00:00:00.000Z"),
    });
    const req = { headers: { authorization: "Bearer session-token" } };
    const res = createResponse();
    const next = vi.fn();

    await requireInboxAccess(req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(req.session).toBeUndefined();
    expect(next).not.toHaveBeenCalled();
  });
});
