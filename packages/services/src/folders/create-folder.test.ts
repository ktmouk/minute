import { folderFactory, userFactory } from "@minute/prisma/vitest/factories";
import { db } from "@minute/prisma/vitest/helpers";
import { it, describe, vi, expect } from "vitest";
import { createFolder } from "./create-folder";

vi.mock("server-only");

describe("createFolder", () => {
  describe("when a folder is root", () => {
    it("creates a folder and hierarchies", async () => {
      const user = await userFactory.create();
      await expect(
        createFolder(db)({
          userId: user.id,
          name: "name",
          emoji: "😀",
          color: "#ffffff",
        }),
      ).resolves.toStrictEqual({
        id: expect.any(String) as unknown,
        userId: user.id,
        color: "#ffffff",
        emoji: "😀",
        name: "name",
        order: 0,
        parentId: null,
        createdAt: expect.any(Date) as unknown,
        updatedAt: expect.any(Date) as unknown,
      });
      const folder = await db.folder.findFirstOrThrow({
        select: {
          id: true,
          userId: true,
          color: true,
          name: true,
          emoji: true,
          parentId: true,
          order: true,
        },
        where: {
          userId: user.id,
        },
      });
      expect(folder).toStrictEqual({
        id: expect.any(String) as unknown,
        color: "#ffffff",
        userId: user.id,
        name: "name",
        emoji: "😀",
        parentId: null,
        order: 0,
      });
      const folderHierarchies = await db.folderHierarchy.findMany({
        select: {
          userId: true,
          ancestorId: true,
          descendantId: true,
          depth: true,
        },
        where: {
          userId: user.id,
        },
      });
      expect(folderHierarchies).toStrictEqual([
        {
          userId: user.id,
          ancestorId: folder.id,
          descendantId: folder.id,
          depth: 0,
        },
        {
          userId: user.id,
          ancestorId: null,
          descendantId: folder.id,
          depth: 1,
        },
      ]);
    });
  });

  describe("when a folder has an ancestor", () => {
    it("creates a folder and hierarchies", async () => {
      const user = await userFactory.create();
      const rootFolder = await folderFactory
        .vars({ user: () => user })
        .use((t) => t.root)
        .create();
      await expect(
        createFolder(db)({
          ancestorId: rootFolder.id,
          userId: user.id,
          name: "child",
          emoji: "😀",
          color: "#ffffff",
        }),
      ).resolves.toStrictEqual({
        id: expect.any(String) as unknown,
        userId: user.id,
        color: "#ffffff",
        emoji: "😀",
        name: "child",
        order: 0,
        parentId: rootFolder.id,
        createdAt: expect.any(Date) as unknown,
        updatedAt: expect.any(Date) as unknown,
      });
      const folder = await db.folder.findFirstOrThrow({
        select: {
          id: true,
          parentId: true,
          order: true,
        },
        where: {
          userId: user.id,
          name: "child",
        },
      });
      expect(folder).toStrictEqual({
        id: expect.any(String) as unknown,
        parentId: rootFolder.id,
        order: 0,
      });
      const folderHierarchies = await db.folderHierarchy.findMany({
        select: {
          userId: true,
          ancestorId: true,
          descendantId: true,
          depth: true,
        },
        where: {
          userId: user.id,
        },
      });
      const expected = [
        {
          depth: 1,
          ancestorId: null,
          descendantId: rootFolder.id,
          userId: user.id,
        },
        {
          depth: 2,
          ancestorId: null,
          descendantId: folder.id,
          userId: user.id,
        },
        {
          depth: 0,
          ancestorId: rootFolder.id,
          descendantId: rootFolder.id,
          userId: user.id,
        },
        {
          depth: 1,
          ancestorId: rootFolder.id,
          descendantId: folder.id,
          userId: user.id,
        },
        {
          depth: 0,
          ancestorId: folder.id,
          descendantId: folder.id,
          userId: user.id,
        },
      ];
      expect(folderHierarchies).toHaveLength(expected.length);
      expect(folderHierarchies).toStrictEqual(expect.arrayContaining(expected));
    });
  });

  describe("when an ancestor folder has children", () => {
    it("sets the folder order correctly", async () => {
      const user = await userFactory.create();
      const rootFolder = await folderFactory
        .vars({ user: () => user })
        .use((t) => t.root)
        .create();
      await folderFactory
        .props({ order: () => 1 })
        .vars({ user: () => user })
        .use((t) => t.withAncestor(rootFolder))
        .create();
      await expect(
        createFolder(db)({
          ancestorId: rootFolder.id,
          userId: user.id,
          name: "child",
          emoji: "😀",
          color: "#ffffff",
        }),
      ).resolves.toStrictEqual({
        id: expect.any(String) as unknown,
        userId: user.id,
        color: "#ffffff",
        emoji: "😀",
        name: "child",
        order: 2,
        parentId: rootFolder.id,
        createdAt: expect.any(Date) as unknown,
        updatedAt: expect.any(Date) as unknown,
      });
      const folder = await db.folder.findFirstOrThrow({
        select: {
          parentId: true,
          order: true,
        },
        where: {
          userId: user.id,
          name: "child",
        },
      });
      expect(folder).toStrictEqual({
        parentId: rootFolder.id,
        order: 2,
      });
    });
  });

  describe("when a user does not have the ancestor folder", () => {
    it("throws an error", async () => {
      const user = await userFactory.create();
      const rootFolder = await folderFactory.use((t) => t.root).create();
      await expect(
        createFolder(db)({
          ancestorId: rootFolder.id,
          userId: user.id,
          name: "name",
          emoji: "😀",
          color: "#ffffff",
        }),
      ).rejects.toThrow("The ancestor folder does not exist.");
      await expect(
        db.folder.findMany({
          where: {
            userId: user.id,
          },
        }),
      ).resolves.toStrictEqual([]);
    });
  });
});
