import { folderFactory, userFactory } from "@minute/prisma/vitest/factories";
import { db } from "@minute/prisma/vitest/helpers";
import { it, describe, vi, expect } from "vitest";
import { createCategory } from "./create-category";

vi.mock("server-only");

describe("createCategory", () => {
  describe("when a user has all folders", () => {
    it("creates the category and its items", async () => {
      const user = await userFactory.create();
      const folders = await folderFactory
        .vars({ user: () => user })
        .createList(3);
      await expect(
        createCategory(db)({
          userId: user.id,
          name: "name",
          emoji: "😀",
          color: "#ff0000",
          folderIds: folders.map(({ id }) => id),
        }),
      ).resolves.toStrictEqual({
        id: expect.any(String) as unknown,
        userId: user.id,
        color: "#ff0000",
        emoji: "😀",
        name: "name",
        createdAt: expect.any(Date) as unknown,
        updatedAt: expect.any(Date) as unknown,
      });
      const category = await db.category.findFirst({
        select: {
          userId: true,
          name: true,
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
      expect(category?.categoryFolders).toHaveLength(3);
      expect(category).toStrictEqual({
        userId: user.id,
        name: "name",
        categoryFolders: expect.arrayContaining(
          folders.map(({ id }) => ({ folderId: id })),
        ) as unknown,
      });
    });
  });

  describe("when a user does not have a folder", () => {
    it("throws an error", async () => {
      const user = await userFactory.create();
      const folder1 = await folderFactory.vars({ user: () => user }).create();
      const folder2 = await folderFactory.create();
      await expect(
        createCategory(db)({
          userId: user.id,
          name: "name",
          emoji: "😀",
          color: "#ff0000",
          folderIds: [folder1.id, folder2.id],
        }),
      ).rejects.toThrow("The folder does not exist.");
      await expect(
        db.category.findFirst({
          where: {
            userId: user.id,
          },
        }),
      ).resolves.toBeNull();
    });
  });
});
