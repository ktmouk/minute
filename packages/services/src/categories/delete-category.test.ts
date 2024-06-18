import {
  categoryFactory,
  categoryFolderFactory,
  folderFactory,
  userFactory,
} from "@minute/prisma/vitest/factories";
import { db } from "@minute/prisma/vitest/helpers";
import { it, describe, vi, expect } from "vitest";
import { deleteCategory } from "./delete-category";

vi.mock("server-only");

describe("deleteCategory", () => {
  describe("when a user has the category", () => {
    it("deletes the category and its items and does not delete folders", async () => {
      const user = await userFactory.create();
      const category = await categoryFactory
        .vars({ user: () => user })
        .create();
      const folder = await folderFactory.vars({ user: () => user }).create();
      const categoryFolder = await categoryFolderFactory
        .vars({
          user: () => user,
          category: () => category,
          folder: () => folder,
        })
        .create();
      await expect(
        deleteCategory(db)({
          id: category.id,
          userId: user.id,
        }),
      ).resolves.toBeUndefined();
      await expect(
        db.categoryFolder.findFirst({
          where: {
            id: categoryFolder.id,
          },
        }),
      ).resolves.toBeNull();
      await expect(
        db.folder.findFirst({
          where: {
            id: folder.id,
          },
        }),
      ).resolves.toStrictEqual(folder);
    });
  });

  describe("when a user does not have the category", () => {
    it("throws an error", async () => {
      const user = await userFactory.create();
      const category = await categoryFactory.create();
      await expect(
        deleteCategory(db)({
          id: category.id,
          userId: user.id,
        }),
      ).rejects.toThrow("The category does not exist.");
      await expect(
        db.category.findFirst({
          where: {
            id: category.id,
          },
        }),
      ).resolves.toStrictEqual(category);
    });
  });
});
