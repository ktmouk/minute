import { folderFactory, userFactory } from "@minute/prisma/vitest/factories";
import { db } from "@minute/prisma/vitest/helpers";
import { it, describe, vi, expect } from "vitest";
import { getFolder } from "./get-folder";

vi.mock("server-only");

describe("getFolder", () => {
  describe("when a user has a folder", () => {
    it("returns a folder", async () => {
      const user = await userFactory.create();
      const folder = await folderFactory.vars({ user: () => user }).create();
      await expect(
        getFolder(db)({
          id: folder.id,
          userId: user.id,
        }),
      ).resolves.toStrictEqual({
        id: folder.id,
        color: folder.color,
        emoji: folder.emoji,
        name: folder.name,
        parentId: null,
        order: folder.order,
        createdAt: folder.createdAt,
        updatedAt: folder.updatedAt,
        userId: user.id,
      });
    });
  });

  describe("when a user does not have a folder", () => {
    it("returns undefined", async () => {
      const user = await userFactory.create();
      const folder = await folderFactory.create();
      await expect(
        getFolder(db)({
          userId: user.id,
          id: folder.id,
        }),
      ).resolves.toBeNull();
    });
  });
});
