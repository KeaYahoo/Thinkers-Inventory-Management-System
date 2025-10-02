import { describe, expect, beforeEach, afterEach, vi, it } from "vitest";
import type { Mock } from "vitest";
import type { Request, Response } from "express";
import { buildPayfastSignature } from "../utils/payfast";
import { PaymentProvider, PaymentStatus } from "@shared/types";

const eqMock = vi.fn<(column: string, value: string) => Promise<{ error: null }>>();
const updateMock = vi.fn<(payload: Record<string, unknown>) => { eq: typeof eqMock }>();
const fromMock = vi.fn<(table: string) => { update: typeof updateMock }>();

vi.mock("../lib/supabaseClient", () => ({
  supabase: {
    from: fromMock,
  },
}));

describe("handlePayfastIPN", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    eqMock.mockResolvedValue({ error: null });
    updateMock.mockImplementation(() => ({ eq: eqMock }));
    fromMock.mockImplementation(() => ({ update: updateMock }));
    process.env.PAYFAST_IP_WHITELIST = "127.0.0.1";
    process.env.PAYFAST_PASSPHRASE = "test-passphrase";
  });

  afterEach(() => {
    delete process.env.PAYFAST_IP_WHITELIST;
    delete process.env.PAYFAST_PASSPHRASE;
  });

  it("updates bookings when signature and IP are valid", async () => {
    const { handlePayfastIPN } = await import("./payfast");
    const payload = {
      merchant_id: "10000100",
      payment_status: "COMPLETE",
      amount_gross: "123.45",
      m_payment_id: "booking-123",
    };
    const signature = buildPayfastSignature(payload, "test-passphrase");
    const req = {
      headers: { "x-forwarded-for": "127.0.0.1" },
      socket: { remoteAddress: "127.0.0.1" },
      ip: "127.0.0.1",
      body: { ...payload, signature },
    } as unknown as Request;

    const send = vi.fn();
    const json = vi.fn();
    const status = vi.fn().mockReturnValue({ send, json });
    const res = { status } as unknown as Response;

    await handlePayfastIPN(req, res, vi.fn());

    expect(status).toHaveBeenCalled();
    expect((status as Mock).mock.calls[0]?.[0]).toBe(200);
    expect(send).toHaveBeenCalledWith("OK");
    expect(fromMock).toHaveBeenCalledWith("bookings");
    expect(updateMock).toHaveBeenCalledWith({
      payment_status: PaymentStatus.Paid,
      payment_provider: PaymentProvider.PayFast,
      payment_metadata: expect.objectContaining({
        payment_status: "COMPLETE",
        provider: PaymentProvider.PayFast,
      }),
    });
    expect(eqMock).toHaveBeenCalledWith("id", "booking-123");
  });

  it("rejects invalid signatures", async () => {
    const { handlePayfastIPN } = await import("./payfast");
    const req = {
      headers: { "x-forwarded-for": "127.0.0.1" },
      socket: { remoteAddress: "127.0.0.1" },
      ip: "127.0.0.1",
      body: { signature: "invalid" },
    } as unknown as Request;

    const send = vi.fn();
    const json = vi.fn();
    const status = vi.fn().mockReturnValue({ send, json });
    const res = { status } as unknown as Response;

    await handlePayfastIPN(req, res, vi.fn());

    expect(status).toHaveBeenCalled();
    expect((status as Mock).mock.calls[0]?.[0]).toBe(400);
    expect(json).toHaveBeenCalledWith({ message: "Invalid signature" });
    expect(updateMock).not.toHaveBeenCalled();
  });

  it("blocks requests from non-whitelisted IPs", async () => {
    process.env.PAYFAST_IP_WHITELIST = "196.0.0.1";
    const { handlePayfastIPN } = await import("./payfast");
    const req = {
      headers: { "x-forwarded-for": "10.0.0.5" },
      socket: { remoteAddress: "10.0.0.5" },
      ip: "10.0.0.5",
      body: {},
    } as unknown as Request;

    const send = vi.fn();
    const status = vi.fn().mockReturnValue({ send });
    const res = { status } as unknown as Response;

    await handlePayfastIPN(req, res, vi.fn());

    expect(status).toHaveBeenCalled();
    expect((status as Mock).mock.calls[0]?.[0]).toBe(403);
    expect(send).toHaveBeenCalledWith("Forbidden");
    expect(updateMock).not.toHaveBeenCalled();
  });
});
