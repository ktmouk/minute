import {
  categoryFactory,
  categoryFolderFactory,
  userFactory,
} from "@minute/prisma/vitest/factories";
import { db } from "@minute/prisma/vitest/helpers";
import { it, describe, vi, expect } from "vitest";
import { getAllCategories } from "./get-all-categories";

vi.mock("server-only");

describe("getAllCategories", () => {
  describe("when a user has categories", () => {
    it("returns categories", async () => {
      const user = await userFactory.create();
      const category = await categoryFactory
        .vars({ user: () => user })
        .create();
      const categoryFolder = await categoryFolderFactory
        .vars({ user: () => user, category: () => category })
        .create();
      await expect(
        getAllCategories(db)({
          userId: user.id,
        }),
      ).resolves.toStrictEqual([
        {
          id: category.id,
          color: category.color,
          emoji: category.emoji,
          name: category.name,
          createdAt: category.createdAt,
          updatedAt: category.updatedAt,
          userId: user.id,
          categoryFolders: [
            {
              id: categoryFolder.id,
              folderId: categoryFolder.folderId,
              categoryId: categoryFolder.categoryId,
              createdAt: categoryFolder.createdAt,
              updatedAt: categoryFolder.updatedAt,
            },
          ],
        },
      ]);
    });
  });

  describe("when a user does not have categories", () => {
    it("returns an empty array", async () => {
      const user = await userFactory.create();
      await categoryFactory.create();
      await expect(
        getAllCategories(db)({
          userId: user.id,
        }),
      ).resolves.toStrictEqual([]);
    });
  });
});
