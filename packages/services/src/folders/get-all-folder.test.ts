import { folderFactory, userFactory } from "@minute/prisma/vitest/factories";
import { db } from "@minute/prisma/vitest/helpers";
import { it, describe, vi, expect } from "vitest";
import { getAllFolders } from "./get-all-folders";

vi.mock("server-only");

describe("getAllFolders", () => {
  describe("when a user has folders", () => {
    it("returns folders", async () => {
      const user = await userFactory.create();
      const rootFolder = await folderFactory
        .vars({ user: () => user })
        .use((t) => t.root)
        .create();
      const folder = await folderFactory
        .vars({ user: () => user })
        .use((t) => t.withAncestor(rootFolder))
        .create();
      const allFolders = await getAllFolders(db)({
        userId: user.id,
      });
      expect(allFolders).toHaveLength(2);
      expect(allFolders).toStrictEqual(
        expect.arrayContaining([
          {
            id: rootFolder.id,
            color: rootFolder.color,
            emoji: rootFolder.emoji,
            name: rootFolder.name,
            parentId: null,
            order: rootFolder.order,
            createdAt: rootFolder.createdAt,
            updatedAt: rootFolder.updatedAt,
            userId: user.id,
          },
          {
            id: folder.id,
            color: folder.color,
            emoji: folder.emoji,
            name: folder.name,
            parentId: rootFolder.id,
            order: folder.order,
            createdAt: folder.createdAt,
            updatedAt: folder.updatedAt,
            userId: user.id,
          },
        ]),
      );
    });
  });

  describe("when a user does not have a folder", () => {
    it("returns undefined", async () => {
      const user = await userFactory.create();
      await folderFactory.use((t) => t.root).create();
      await expect(
        getAllFolders(db)({
          userId: user.id,
        }),
      ).resolves.toStrictEqual([]);
    });
  });
});
