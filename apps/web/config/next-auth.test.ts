import { faker } from "@faker-js/faker";
import { userFactory } from "@minute/prisma/vitest/factories";
import { db } from "@minute/prisma/vitest/helpers";
import { describe, expect, it, vi } from "vitest";
import { authOptions } from "./next-auth";

vi.mock("server-only");

vi.mock("next/headers", () => ({
  headers: () => {
    const map = new Map();
    map.set("user-agent", "user-agent");
    map.set("x-real-ip", "127.0.0.1");
    return map;
  },
}));

describe("authOptions", () => {
  describe("signIn callback", () => {
    describe("when the user signed in", () => {
      describe("when the providerAccountId is allowed", () => {
        it("returns true", async () => {
          const signIn = authOptions.callbacks?.signIn as (
            ...arg: unknown[]
          ) => unknown;
          await expect(
            signIn({
              user: { name: "name" },
              account: { provider: "github", providerAccountId: "1234" },
            }),
          ).resolves.toBe(true);
        });
      });

      describe("when the providerAccountId is disallowed", () => {
        it("returns false and creates a log", async () => {
          const name = faker.string.uuid();
          const signIn = authOptions.callbacks?.signIn as (
            ...arg: unknown[]
          ) => unknown;
          await expect(
            signIn({
              user: { name },
              account: { provider: "github", providerAccountId: "2345" },
            } as unknown),
          ).resolves.toBe(false);
          await expect(
            db.userSecurityLog.findFirst({
              where: {
                name,
              },
            }),
          ).resolves.toStrictEqual({
            id: expect.any(String) as unknown,
            name,
            provider: "github",
            providerAccountId: "2345",
            type: "BLOCK_SIGN_IN",
            ipAddress: "127.0.0.1",
            userAgent: "user-agent",
            createdAt: expect.any(Date) as unknown,
          });
        });
      });

      describe("when the providerAccountId is undefined", () => {
        it("returns false and creates a log", async () => {
          const name = faker.string.uuid();
          const signIn = authOptions.callbacks?.signIn as (
            ...arg: unknown[]
          ) => unknown;
          await expect(
            signIn({
              user: { name },
              account: { provider: "github", providerAccountId: undefined },
            } as unknown),
          ).resolves.toBe(false);
          await expect(
            db.userSecurityLog.findFirst({
              where: {
                name,
              },
            }),
          ).resolves.toStrictEqual({
            id: expect.any(String) as unknown,
            name,
            provider: "github",
            providerAccountId: null,
            type: "BLOCK_SIGN_IN",
            ipAddress: "127.0.0.1",
            userAgent: "user-agent",
            createdAt: expect.any(Date) as unknown,
          });
        });
      });

      describe("when the providerAccountId is null", () => {
        it("returns false and creates a log", async () => {
          const name = faker.string.uuid();
          const signIn = authOptions.callbacks?.signIn as (
            ...arg: unknown[]
          ) => unknown;
          await expect(
            signIn({
              user: { name },
              account: { provider: "github", providerAccountId: null },
            } as unknown),
          ).resolves.toBe(false);
          await expect(
            db.userSecurityLog.findFirst({
              where: {
                name,
              },
            }),
          ).resolves.toStrictEqual({
            id: expect.any(String) as unknown,
            name,
            provider: "github",
            providerAccountId: null,
            type: "BLOCK_SIGN_IN",
            ipAddress: "127.0.0.1",
            userAgent: "user-agent",
            createdAt: expect.any(Date) as unknown,
          });
        });
      });
    });
  });

  describe("signIn events", () => {
    describe("when the user signed in", () => {
      describe("when the event is called", () => {
        it("creates a log", async () => {
          const name = faker.string.uuid();
          const signIn = authOptions.events?.signIn as (
            ...arg: unknown[]
          ) => unknown;
          await expect(
            signIn({
              user: { name },
              account: { provider: "github", providerAccountId: "1234" },
            }),
          ).resolves.toBeUndefined();
          await expect(
            db.userSecurityLog.findFirst({
              where: {
                name,
              },
            }),
          ).resolves.toStrictEqual({
            id: expect.any(String) as unknown,
            name,
            provider: "github",
            providerAccountId: "1234",
            type: "SIGN_IN",
            ipAddress: "127.0.0.1",
            userAgent: "user-agent",
            createdAt: expect.any(Date) as unknown,
          });
        });
      });
    });
  });

  describe("signOut events", () => {
    describe("when the user signed out", () => {
      describe("when the event is called", () => {
        it("creates a log", async () => {
          const count = await db.userSecurityLog.count({
            where: {
              type: "SIGN_OUT",
            },
          });
          const signOut = authOptions.events?.signOut as (
            ...arg: unknown[]
          ) => unknown;
          await expect(signOut()).resolves.toBeUndefined();
          await expect(
            db.userSecurityLog.count({
              where: {
                type: "SIGN_OUT",
              },
            }),
          ).resolves.toBe(count + 1);
        });
      });
    });
  });

  describe("linkAccount events", () => {
    describe("when the user signed out", () => {
      describe("when the event is called", () => {
        it("creates a log", async () => {
          const name = faker.string.uuid();
          const linkAccount = authOptions.events?.linkAccount as (
            ...arg: unknown[]
          ) => unknown;
          await expect(
            linkAccount({
              user: { name },
              account: { provider: "github", providerAccountId: "1234" },
            }),
          ).resolves.toBeUndefined();
          await expect(
            db.userSecurityLog.findFirst({
              where: {
                name,
              },
            }),
          ).resolves.toStrictEqual({
            id: expect.any(String) as unknown,
            name,
            provider: "github",
            providerAccountId: "1234",
            type: "LINK_ACCOUNT",
            ipAddress: "127.0.0.1",
            userAgent: "user-agent",
            createdAt: expect.any(Date) as unknown,
          });
        });
      });
    });
  });

  describe("createUser events", () => {
    describe("when the user signed out", () => {
      describe("when the event is called", () => {
        it("creates a log and sample data", async () => {
          const user = await userFactory
            .props({ name: () => faker.string.uuid() })
            .create();
          const CREATE_USER = authOptions.events?.createUser as (
            ...arg: unknown[]
          ) => unknown;
          await expect(
            CREATE_USER({
              user,
              account: { provider: "github", providerAccountId: "1234" },
            }),
          ).resolves.toBeUndefined();
          await expect(
            db.userSecurityLog.findFirst({
              where: {
                name: user.name,
              },
            }),
          ).resolves.toStrictEqual({
            id: expect.any(String) as unknown,
            name: user.name,
            provider: null,
            providerAccountId: null,
            type: "CREATE_USER",
            ipAddress: "127.0.0.1",
            userAgent: "user-agent",
            createdAt: expect.any(Date) as unknown,
          });
          await expect(
            db.folder.count({
              where: {
                userId: user.id,
              },
            }),
          ).resolves.toBe(4);
          await expect(
            db.category.count({
              where: {
                userId: user.id,
              },
            }),
          ).resolves.toBe(2);
          await expect(
            db.chart.count({
              where: {
                userId: user.id,
              },
            }),
          ).resolves.toBe(1);
        });
      });
    });
  });
});
