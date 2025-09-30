import { test, expect } from "@playwright/test";
import { setupDefaultMocks } from "./utils";

test.describe("Authentication", () => {
  test("user can sign up, log out, and log back in", async ({ page }) => {
    await setupDefaultMocks(page);

    await page.goto("/");
    await page.getByRole("link", { name: /sign up/i }).click();

    await page.getByLabel(/email/i).fill("newuser@example.com");
    await page.getByLabel(/password/i).fill("Password123!");
    await page.getByRole("button", { name: /create account/i }).click();

    await page.waitForURL("**/dashboard");
    await expect(page.getByRole("heading", { name: /welcome, newuser@example.com!/i })).toBeVisible();

    await page.getByRole("button", { name: /^log out$/i }).first().click();
    await page.waitForURL("**/login");
    await expect(page.getByRole("heading", { name: /log in/i })).toBeVisible();

    await page.getByLabel(/email/i).fill("newuser@example.com");
    await page.getByLabel(/password/i).fill("Password123!");
    await page.getByRole("button", { name: /^log in$/i }).last().click();

    await page.waitForURL("**/dashboard");
    await expect(page.getByRole("heading", { name: /welcome, newuser@example.com!/i })).toBeVisible();
  });
});
