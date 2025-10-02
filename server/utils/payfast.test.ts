import { describe, expect, it } from "vitest";
import {
  buildPayfastSignature,
  verifyPayfastSignature,
  mapPayfastPaymentStatus,
  normalisePayfastValue,
} from "./payfast";
import { PaymentStatus } from "@shared/types";

describe("payfast utils", () => {
  it("builds deterministic signatures including passphrase", () => {
    const params = {
      amount: "123.45",
      item_name: "Safari Adventure",
      merchant_id: "10000100",
      merchant_key: "46f0cd694581a",
      return_url: "https://example.com/success",
    };

    const signature = buildPayfastSignature(params, "super-secret");
    expect(signature).toEqual("60a9d99b40ce7e61992b4ed276de49c3");
  });

  it("verifies signatures when payload is untampered", () => {
    const params = {
      amount: "999.00",
      item_name: "Garden Route Getaway",
    };
    const signature = buildPayfastSignature(params, "passphrase");
    const payload = { ...params, signature };
    expect(verifyPayfastSignature(payload, "passphrase")).toBe(true);
  });

  it("rejects signatures when payload changes", () => {
    const params = {
      amount: "999.00",
      item_name: "Garden Route Getaway",
    };
    const signature = buildPayfastSignature(params, "passphrase");
    const payload = { ...params, amount: "1000.00", signature };
    expect(verifyPayfastSignature(payload, "passphrase")).toBe(false);
  });

  it("maps PayFast statuses to internal PaymentStatus values", () => {
    expect(mapPayfastPaymentStatus("COMPLETE")).toBe(PaymentStatus.Paid);
    expect(mapPayfastPaymentStatus("FAILED")).toBe(PaymentStatus.Failed);
    expect(mapPayfastPaymentStatus("CANCELLED")).toBe(PaymentStatus.Failed);
    expect(mapPayfastPaymentStatus(undefined)).toBe(PaymentStatus.Pending);
  });

  it("normalises values using PayFast encoding rules", () => {
    expect(normalisePayfastValue("Cape Town Adventure")).toBe("Cape+Town+Adventure");
    expect(normalisePayfastValue("https://example.com/return?ref=1")).toBe(
      "https%3A%2F%2Fexample.com%2Freturn%3Fref%3D1",
    );
  });
});
