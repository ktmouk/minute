import { faker } from "@faker-js/faker";
import { db } from "@minute/prisma/vitest/helpers";
import { it, describe, vi, expect } from "vitest";
import { createUserSecurityLog } from "./create-user-security-log";

vi.mock("server-only");

describe("createUserSecurityLog", () => {
  describe("when it is called", () => {
    it("creates a log", async () => {
      const name = faker.string.uuid();
      await expect(
        createUserSecurityLog(db)({
          type: "SIGN_IN",
          name,
          provider: "github",
          providerAccountId: "1234",
          userAgent: "user-agent",
          ipAddress: "127.0.0.1",
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
