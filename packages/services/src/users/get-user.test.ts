import { userFactory } from "@minute/prisma/vitest/factories";
import { db } from "@minute/prisma/vitest/helpers";
import { it, describe, vi, expect } from "vitest";
import { getUser } from "..";

vi.mock("server-only");

describe("getUser", () => {
  describe("when the user exists", () => {
    it("returns the user", async () => {
      const user = await userFactory.create();
      await expect(
        getUser(db)({
          userId: user.id,
        }),
      ).resolves.toStrictEqual({
        id: user.id,
        image: user.image,
        name: user.name,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      });
    });
  });

  describe("when the user does not exist", () => {
    it("throws an error", async () => {
      await expect(
        getUser(db)({
          userId: "8641ec65-3e59-43e1-808a-97e926231145",
        }),
      ).rejects.toThrow("The user does not exist.");
    });
  });
});
