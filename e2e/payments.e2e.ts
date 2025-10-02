import { test, expect } from "@playwright/test";
import { setupDefaultMocks } from "./utils";
import { buildPayfastSignature } from "../server/utils/payfast";

process.env.PAYFAST_PASSPHRASE = process.env.PAYFAST_PASSPHRASE ?? "test-passphrase";

test.describe("PayFast integration", () => {
  test("redirects to PayFast and shows paid status after IPN", async ({ page }) => {
    const { createJwt } = await setupDefaultMocks(page);
    const token = createJwt({ role: "user", userId: "user-1", email: "traveler@example.com" });

    await page.addInitScript((storedToken: string) => {
      window.localStorage.setItem("trvlsync_token", storedToken);
    }, token);

    await page.goto("/trips/trip-1");
    await page.waitForLoadState("networkidle");

    const paymentResponsePromise = page.waitForResponse((response) =>
      response.url().endsWith("/api/payments") && response.request().method() === "POST" && response.status() === 201,
    );

    const bookNowButton = page.getByRole("button", { name: /book now/i }).first();
    await expect(bookNowButton).toBeEnabled();
    await bookNowButton.click();

    const paymentResponse = await paymentResponsePromise;
    const paymentPayload = (await paymentResponse.json()) as { bookingId: string; paymentUrl: string };
    expect(paymentPayload.paymentUrl).toContain("sandbox.payfast.co.za/eng/process");

    const bookingId = paymentPayload.bookingId;
    await page.goto(`/payment-status/${bookingId}?status=success`);
    await expect(page.getByRole("heading", { name: /payment in progress/i })).toBeVisible();

    const params = new URLSearchParams({
      merchant_id: "10000100",
      merchant_key: "46f0cd694581a",
      amount_gross: "123.45",
      m_payment_id: bookingId,
      payment_status: "COMPLETE",
      pf_payment_id: "pf-mock-001",
    });
    const signature = buildPayfastSignature(Object.fromEntries(params), process.env.PAYFAST_PASSPHRASE);
    params.set("signature", signature);

    await page.evaluate(async (body) => {
      await fetch("/api/payfast/ipn", {
        method: "POST",
        headers: { "content-type": "application/x-www-form-urlencoded" },
        body,
      });
    }, params.toString());

    const bookingData = await page.evaluate(async (id) => {
      const response = await fetch(`/api/bookings/${id}`);
      return (await response.json()) as { payment_status: string };
    }, bookingId);
    expect(bookingData.payment_status).toBe("paid");

    await page.reload();
    await expect(page.getByText(/status: paid/i)).toBeVisible({ timeout: 8_000 });
  });

  test("shows failed status when IPN reports failure", async ({ page }) => {
    const { createJwt } = await setupDefaultMocks(page);
    const token = createJwt({ role: "user", userId: "user-1", email: "traveler@example.com" });

    await page.addInitScript((storedToken: string) => {
      window.localStorage.setItem("trvlsync_token", storedToken);
    }, token);

    await page.goto("/trips/trip-1");
    await page.waitForLoadState("networkidle");

    const paymentResponsePromise = page.waitForResponse((response) =>
      response.url().endsWith("/api/payments") && response.request().method() === "POST" && response.status() === 201,
    );

    await page.getByRole("button", { name: /book now/i }).first().click();
    const paymentResponse = await paymentResponsePromise;
    const paymentPayload = (await paymentResponse.json()) as { bookingId: string; paymentUrl: string };
    expect(paymentPayload.paymentUrl).toContain("sandbox.payfast.co.za/eng/process");
    const bookingId = paymentPayload.bookingId;

    await page.goto(`/payment-status/${bookingId}?status=cancelled`);
    await expect(page.getByRole("heading", { name: /payment cancelled/i })).toBeVisible();

    const params = new URLSearchParams({
      merchant_id: "10000100",
      merchant_key: "46f0cd694581a",
      amount_gross: "123.45",
      m_payment_id: bookingId,
      payment_status: "FAILED",
      pf_payment_id: "pf-mock-002",
    });
    const signature = buildPayfastSignature(Object.fromEntries(params), process.env.PAYFAST_PASSPHRASE);
    params.set("signature", signature);

    await page.evaluate(async (body) => {
      await fetch("/api/payfast/ipn", {
        method: "POST",
        headers: { "content-type": "application/x-www-form-urlencoded" },
        body,
      });
    }, params.toString());

    const bookingData = await page.evaluate(async (id) => {
      const response = await fetch(`/api/bookings/${id}`);
      return (await response.json()) as { payment_status: string };
    }, bookingId);
    expect(bookingData.payment_status).toBe("failed");

    await page.reload();
    await expect(page.getByText(/status: failed/i)).toBeVisible({ timeout: 8_000 });
  });
});
