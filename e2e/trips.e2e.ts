import { test, expect } from "@playwright/test";
import { setupDefaultMocks } from "./utils";

test.describe("Trip discovery and booking", () => {
  test("user can filter trips and start a booking", async ({ page }) => {
    const { createJwt } = await setupDefaultMocks(page);
    const token = createJwt({ role: "user", userId: "user-1", email: "traveler@example.com" });

    await page.addInitScript((storedToken: string) => {
      window.localStorage.setItem("trvlsync_token", storedToken);
    }, token);

    await page.goto("/trips");
    await expect(page.getByRole("heading", { name: /available trips/i })).toBeVisible();

    const searchField = page.getByPlaceholder("Search by name or location...");
    await searchField.fill("Garden");
    await searchField.blur();

    await expect(page.locator('a[aria-label="View details for Garden Route Getaway"]')).toHaveCount(1);

    const slider = page.getByRole("slider", { name: /max price/i });
    await slider.fill("5500");
    await expect(page.getByText(/max price: R5500/i)).toBeVisible();

    await page.goto("/trips/trip-2");
    await page.waitForLoadState("networkidle");

    const bookNowButton = page.getByRole("button", { name: /book now/i }).first();
    await bookNowButton.waitFor({ state: "visible" });
    await expect(bookNowButton).toBeEnabled();
    await bookNowButton.click();

    await page.waitForURL("**/payment/checkout/booking-checkout-1");
    await expect(page).toHaveURL(/payment\/checkout\/booking-checkout-1$/);
  });
});
