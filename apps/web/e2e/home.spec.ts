import { sessionFactory } from "@minute/prisma/vitest/factories";
import { test, expect } from "@playwright/test";
import { addDays } from "date-fns";

test.describe("when a user is not signed in", () => {
  test("redirects to the sign in page", async ({ page }) => {
    const res = await page.goto("/app");
    await expect(page).toHaveURL("/en/auth/sign-in?callbackUrl=%2Fapp");
    expect(res?.headers()["cache-control"]).toBe(
      "private, no-cache, no-store, max-age=0, must-revalidate",
    );
    expect(res?.headers()["referrer-policy"]).toBe("no-referrer");
    expect(res?.headers()["x-frame-options"]).toBe("DENY");
    expect(res?.headers()["x-xss-protection"]).toBe("1; mode=block");
  });
});

test.describe("when a user is signed in", () => {
  test("creates a folder and starts a timer", async ({ browser }) => {
    const session = await sessionFactory
      .props({ expires: () => addDays(new Date(), 1) })
      .create();
    const context = await browser.newContext();
    await context.addCookies([
      {
        name: "next-auth.session-token",
        domain: "localhost",
        path: "/",
        value: session.sessionToken,
        httpOnly: true,
        sameSite: "Lax",
      },
    ]);
    const page = await context.newPage();

    const res = await page.goto("/app");
    expect(res?.headers()["cache-control"]).toBe(
      "private, no-cache, no-store, max-age=0, must-revalidate",
    );
    expect(res?.headers()["referrer-policy"]).toBe("no-referrer");
    expect(res?.headers()["x-frame-options"]).toBe("DENY");
    expect(res?.headers()["x-xss-protection"]).toBe("1; mode=block");

    await expect(page).toHaveURL("/en/app");
    await page.getByRole("button", { name: "Add New Folder" }).click();
    await page.getByPlaceholder("Enter folder name...").fill("test");
    await page.getByRole("main").click();
    await page
      .getByPlaceholder("Enter the description of what")
      .fill("example task");
    await page.getByRole("main").click();
    await page.getByLabel("Start Working").click();
    await expect(page.getByLabel("Stop Working")).toBeVisible();
    await page.getByLabel("Stop Working").click();
    await expect(
      page.getByRole("button", { name: /example task/ }),
    ).toBeVisible();
    await browser.close();
  });
});
