import {
  categoryFactory,
  categoryFolderFactory,
  folderFactory,
  userFactory,
} from "@minute/prisma/vitest/factories";
import { db } from "@minute/prisma/vitest/helpers";
import { it, describe, vi, expect } from "vitest";
import { updateCategory } from "./update-category";

vi.mock("server-only");

describe("updateCategory", () => {
  describe("when a folderIds is changed", () => {
    it("updates the category and its items", async () => {
      const user = await userFactory.create();
      const category = await categoryFactory
        .vars({ user: () => user })
        .create();
      await categoryFolderFactory
        .vars({ user: () => user, category: () => category })
        .create();
      const folders = await folderFactory
        .vars({ user: () => user })
        .createList(3);
      await expect(
        updateCategory(db)({
          id: category.id,
          userId: user.id,
          name: "name",
          emoji: "😀",
          color: "#ff0000",
          folderIds: folders.map(({ id }) => id),
        }),
      ).resolves.toBeUndefined();
      const updatedCategory = await db.category.findFirst({
        select: {
          userId: true,
          name: true,
          emoji: true,
          color: true,
          categoryFolders: {
            select: {
              folderId: true,
            },
          },
        },
        where: {
          userId: user.id,
        },
      });
      expect(updatedCategory?.categoryFolders).toHaveLength(3);
      expect(updatedCategory).toStrictEqual({
        userId: user.id,
        name: "name",
        emoji: "😀",
        color: "#ff0000",
        categoryFolders: expect.arrayContaining(
          folders.map(({ id }) => ({ folderId: id })),
        ) as unknown,
      });
    });
  });

  describe("when a folderIds are empty", () => {
    it("throws an error", async () => {
      const user = await userFactory.create();
      const category = await categoryFactory
        .vars({ user: () => user })
        .create();
      await categoryFolderFactory
        .vars({ user: () => user, category: () => category })
        .create();
      await expect(
        updateCategory(db)({
          id: category.id,
          userId: user.id,
          name: "name",
          emoji: "😀",
          color: "#ff0000",
          folderIds: [],
        }),
      ).rejects.toThrow();
      await expect(
        db.category.findFirst({
          where: {
            userId: user.id,
          },
        }),
      ).resolves.toStrictEqual(category);
    });
  });

  describe("when a folderIds is not changed", () => {
    it("updates the category and its items", async () => {
      const user = await userFactory.create();
      const category = await categoryFactory
        .vars({ user: () => user })
        .create();
      const categoryFolder = await categoryFolderFactory
        .vars({ user: () => user, category: () => category })
        .create();
      await expect(
        updateCategory(db)({
          id: category.id,
          userId: user.id,
          name: "name",
          emoji: "😀",
          color: "#ff0000",
        }),
      ).resolves.toBeUndefined();
      const updatedCategory = await db.category.findFirst({
        select: {
          userId: true,
          name: true,
          emoji: true,
          color: true,
          categoryFolders: {
            select: {
              folderId: true,
            },
          },
        },
        where: {
          userId: user.id,
        },
      });
      expect(updatedCategory?.categoryFolders).toHaveLength(1);
      expect(updatedCategory).toStrictEqual({
        userId: user.id,
        name: "name",
        emoji: "😀",
        color: "#ff0000",
        categoryFolders: [{ folderId: categoryFolder.folderId }],
      });
    });
  });

  describe("when a user does not have a folder", () => {
    it("throws an error", async () => {
      const user = await userFactory.create();
      const category = await categoryFactory
        .vars({ user: () => user })
        .create();
      const folder1 = await folderFactory.vars({ user: () => user }).create();
      const folder2 = await folderFactory.create();
      await expect(
        updateCategory(db)({
          id: category.id,
          userId: user.id,
          name: "name",
          folderIds: [folder1.id, folder2.id],
        }),
      ).rejects.toThrow("The folder does not exist.");
      await expect(
        db.category.findFirst({
          where: {
            userId: user.id,
          },
        }),
      ).resolves.toStrictEqual(category);
    });
  });

  describe("when a user does not have a category", () => {
    it("throws an error", async () => {
      const user = await userFactory.create();
      const category = await categoryFactory.create();
      await expect(
        updateCategory(db)({
          id: category.id,
          userId: user.id,
          name: "name",
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
