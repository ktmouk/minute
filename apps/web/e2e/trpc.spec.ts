/* eslint-disable testing-library/prefer-screen-queries */

import { sessionFactory, userFactory } from "@minute/prisma/vitest/factories";
import { test, request, expect } from "@playwright/test";
import { addDays } from "date-fns";

test.describe("when a user is signed in", () => {
  test("returns 200", async () => {
    const session = await sessionFactory
      .props({ expires: () => addDays(new Date(), 1) })
      .create();
    const context = await request.newContext();
    const res = await context.get("/api/trpc/folders.getAllFolders", {
      headers: {
        "Content-Type": "application/json",
        "X-Requested-With": "XMLHttpRequest",
        Cookie: `next-auth.session-token=${session.sessionToken}`,
      },
    });
    expect(res.status()).toBe(200);
    expect(res.headers()["cache-control"]).toBe(
      "private, no-store, no-cache, must-revalidate",
    );
    expect(res.headers()["pragma"]).toBe("no-cache");
    expect(res.headers()["referrer-policy"]).toBe("no-referrer");
    expect(res.headers()["x-frame-options"]).toBe("DENY");
    expect(res.headers()["x-xss-protection"]).toBe("1; mode=block");
  });
});

test.describe("when a user is not signed in", () => {
  test("returns 401", async () => {
    const context = await request.newContext();
    const res = await context.get("/api/trpc/folders.getAllFolders", {
      headers: {
        "Content-Type": "application/json",
        "X-Requested-With": "XMLHttpRequest",
      },
    });
    expect(res.status()).toBe(401);
  });
});

test.describe("when a request has an unknown session", () => {
  test("returns 401", async () => {
    const context = await request.newContext();
    const res = await context.get("/api/trpc/folders.getAllFolders", {
      headers: {
        "Content-Type": "application/json",
        "X-Requested-With": "XMLHttpRequest",
        Cookie: "next-auth.session-token=unknown",
      },
    });
    expect(res.status()).toBe(401);
  });
});

test.describe("when a request has an session that has been expired", () => {
  test("returns 401", async () => {
    const session = await sessionFactory
      .props({ expires: () => addDays(new Date(), -1) })
      .create();
    const context = await request.newContext();
    const res = await context.get("/api/trpc/folders.getAllFolders", {
      headers: {
        "Content-Type": "application/json",
        "X-Requested-With": "XMLHttpRequest",
        Cookie: `next-auth.session-token=${session.sessionToken}`,
      },
    });
    expect(res.status()).toBe(401);
  });
});

test.describe("when a request does not have X-Requested-With header", () => {
  test("returns 400", async () => {
    const session = await sessionFactory
      .props({ expires: () => addDays(new Date(), 1) })
      .create();
    const context = await request.newContext();
    const res = await context.get("/api/trpc/folders.getAllFolders", {
      headers: {
        "Content-Type": "application/json",
        Cookie: `next-auth.session-token=${session.sessionToken}`,
      },
    });
    expect(res.status()).toBe(400);
  });
});

test.describe("when a request does not have valid X-Requested-With header", () => {
  test("returns 400", async () => {
    const session = await sessionFactory
      .props({ expires: () => addDays(new Date(), 1) })
      .create();
    const context = await request.newContext();
    const res = await context.get("/api/trpc/folders.getAllFolders", {
      headers: {
        "Content-Type": "application/json",
        "X-Requested-With": "invalid",
        Cookie: `next-auth.session-token=${session.sessionToken}`,
      },
    });
    expect(res.status()).toBe(400);
  });
});

test.describe("when a request has an invalid Content-Type", () => {
  test("returns 400", async () => {
    const session = await sessionFactory
      .props({ expires: () => addDays(new Date(), 1) })
      .create();
    const context = await request.newContext();
    const res = await context.get("/api/trpc/folders.getAllFolders", {
      headers: {
        "Content-Type": "text/plain",
        "X-Requested-With": "XMLHttpRequest",
        Cookie: `next-auth.session-token=${session.sessionToken}`,
      },
    });
    expect(res.status()).toBe(400);
  });
});

test.describe("when a request has an invalid origin header", () => {
  test("returns 400", async () => {
    const session = await sessionFactory
      .props({ expires: () => addDays(new Date(), 1) })
      .create();
    const context = await request.newContext();
    const res = await context.get("/api/trpc/folders.getAllFolders", {
      headers: {
        Origin: "http://localhost:1111",
        "Content-Type": "application/json",
        "X-Requested-With": "XMLHttpRequest",
        Cookie: `next-auth.session-token=${session.sessionToken}`,
      },
    });
    expect(res.status()).toBe(400);
  });
});

test.describe("when a request is sent from a form", () => {
  test("returns 400", async () => {
    const user = await userFactory.create();
    const session = await sessionFactory
      .props({ expires: () => addDays(new Date(), 1) })
      .vars({ user: () => user })
      .create();
    const context = await request.newContext();
    const res = await context.get("/api/trpc/folders.getAllFolders", {
      multipart: new FormData(),
      headers: {
        Cookie: `next-auth.session-token=${session.sessionToken}`,
      },
    });
    expect(res.status()).toBe(400);
  });
});
