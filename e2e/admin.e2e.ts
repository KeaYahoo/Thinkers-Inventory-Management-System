import { test, expect } from "@playwright/test";
import { setupDefaultMocks } from "./utils";

test.describe("Admin moderation", () => {
  test("admin can approve and delete pending reviews", async ({ page }) => {
    await setupDefaultMocks(page);

    await page.goto("/login");
    await page.getByLabel(/email/i).fill("admin@example.com");
    await page.getByLabel(/password/i).fill("SecurePass123!");
    await page.getByRole("button", { name: /^log in$/i }).last().click();

    await page.waitForURL("**/dashboard");
    await page.getByRole("link", { name: /^admin$/i }).click();
    await page.waitForURL("**/admin");

    await expect(page.getByRole("heading", { name: /admin dashboard/i })).toBeVisible();

    const firstPending = page.getByRole("listitem").filter({ hasText: "traveler.one@example.com" });
    await expect(firstPending).toBeVisible();
    await firstPending.getByRole("button", { name: /approve/i }).click();
    await expect(firstPending).toHaveCount(0);

    const secondPending = page.getByRole("listitem").filter({ hasText: "traveler.two@example.com" });
    await expect(secondPending).toBeVisible();
    await secondPending.getByRole("button", { name: /delete/i }).click();

    await expect(page.getByText(/no reviews are awaiting moderation/i)).toBeVisible();
  });
});
