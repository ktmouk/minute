import { folderFactory, userFactory } from "@minute/prisma/vitest/factories";
import { db } from "@minute/prisma/vitest/helpers";
import { it, describe, vi, expect } from "vitest";
import { moveFolder } from "./move-folder";

vi.mock("server-only");

describe("moveFolder", () => {
  describe("when a folder moves to another root", () => {
    it("moves a folder", async () => {
      const user = await userFactory.create();
      const root1Folder = await folderFactory
        .vars({ user: () => user })
        .use((t) => t.root)
        .create();
      const root2Folder = await folderFactory
        .vars({ user: () => user })
        .use((t) => t.root)
        .create();
      const childFolder = await folderFactory
        .vars({ user: () => user })
        .use((t) => t.withAncestor(root1Folder))
        .create();
      await moveFolder(db)({
        folderId: childFolder.id,
        ancestorId: root2Folder.id,
        afterFolderId: null,
        userId: user.id,
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
        orderBy: { ancestorId: "asc" },
      });
      const expected = [
        {
          depth: 1,
          ancestorId: null,
          descendantId: root1Folder.id,
          userId: user.id,
        },
        {
          depth: 1,
          ancestorId: null,
          descendantId: root2Folder.id,
          userId: user.id,
        },
        {
          depth: 2,
          ancestorId: null,
          descendantId: childFolder.id,
          userId: user.id,
        },
        {
          depth: 0,
          ancestorId: root1Folder.id,
          descendantId: root1Folder.id,
          userId: user.id,
        },
        {
          depth: 0,
          ancestorId: root2Folder.id,
          descendantId: root2Folder.id,
          userId: user.id,
        },
        {
          depth: 1,
          ancestorId: root2Folder.id,
          descendantId: childFolder.id,
          userId: user.id,
        },
        {
          depth: 0,
          ancestorId: childFolder.id,
          descendantId: childFolder.id,
          userId: user.id,
        },
      ];
      expect(folderHierarchies).toHaveLength(expected.length);
      expect(folderHierarchies).toStrictEqual(expect.arrayContaining(expected));
    });
  });

  describe("when a folder become a root", () => {
    it("moves a folder", async () => {
      const user = await userFactory.create();
      const root1Folder = await folderFactory
        .vars({ user: () => user })
        .use((t) => t.root)
        .create();
      const childFolder = await folderFactory
        .vars({ user: () => user })
        .use((t) => t.withAncestor(root1Folder))
        .create();
      await moveFolder(db)({
        folderId: childFolder.id,
        ancestorId: null,
        afterFolderId: null,
        userId: user.id,
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
        orderBy: { ancestorId: "asc" },
      });
      const expected = [
        {
          depth: 1,
          ancestorId: null,
          descendantId: root1Folder.id,
          userId: user.id,
        },
        {
          depth: 1,
          ancestorId: null,
          descendantId: childFolder.id,
          userId: user.id,
        },
        {
          depth: 0,
          ancestorId: root1Folder.id,
          descendantId: root1Folder.id,
          userId: user.id,
        },
        {
          depth: 0,
          ancestorId: childFolder.id,
          descendantId: childFolder.id,
          userId: user.id,
        },
      ];
      expect(folderHierarchies).toHaveLength(expected.length);
      expect(folderHierarchies).toStrictEqual(expect.arrayContaining(expected));
    });
  });

  describe("when a folder moves to another child folder", () => {
    it("moves a folder", async () => {
      const user = await userFactory.create();
      const rootFolder = await folderFactory
        .vars({ user: () => user })
        .use((t) => t.root)
        .create();
      const child1Folder = await folderFactory
        .vars({ user: () => user })
        .use((t) => t.withAncestor(rootFolder))
        .create();
      const child2Folder = await folderFactory
        .vars({ user: () => user })
        .use((t) => t.withAncestor(rootFolder))
        .create();
      const grandChildFolder = await folderFactory
        .vars({ user: () => user })
        .use((t) => t.withAncestor(child1Folder))
        .create();
      const greatGrandChildFolder = await folderFactory
        .vars({ user: () => user })
        .use((t) => t.withAncestor(grandChildFolder))
        .create();
      await moveFolder(db)({
        folderId: grandChildFolder.id,
        ancestorId: child2Folder.id,
        afterFolderId: null,
        userId: user.id,
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
        orderBy: { ancestorId: "asc" },
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
          descendantId: child1Folder.id,
          userId: user.id,
        },
        {
          depth: 2,
          ancestorId: null,
          descendantId: child2Folder.id,
          userId: user.id,
        },
        {
          depth: 3,
          ancestorId: null,
          descendantId: grandChildFolder.id,
          userId: user.id,
        },
        {
          depth: 4,
          ancestorId: null,
          descendantId: greatGrandChildFolder.id,
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
          descendantId: child1Folder.id,
          userId: user.id,
        },
        {
          depth: 1,
          ancestorId: rootFolder.id,
          descendantId: child2Folder.id,
          userId: user.id,
        },
        {
          depth: 2,
          ancestorId: rootFolder.id,
          descendantId: grandChildFolder.id,
          userId: user.id,
        },
        {
          depth: 3,
          ancestorId: rootFolder.id,
          descendantId: greatGrandChildFolder.id,
          userId: user.id,
        },
        {
          depth: 0,
          ancestorId: child1Folder.id,
          descendantId: child1Folder.id,
          userId: user.id,
        },
        {
          depth: 0,
          ancestorId: child2Folder.id,
          descendantId: child2Folder.id,
          userId: user.id,
        },
        {
          depth: 1,
          ancestorId: child2Folder.id,
          descendantId: grandChildFolder.id,
          userId: user.id,
        },
        {
          depth: 2,
          ancestorId: child2Folder.id,
          descendantId: greatGrandChildFolder.id,
          userId: user.id,
        },
        {
          depth: 0,
          ancestorId: grandChildFolder.id,
          descendantId: grandChildFolder.id,
          userId: user.id,
        },
        {
          depth: 1,
          ancestorId: grandChildFolder.id,
          descendantId: greatGrandChildFolder.id,
          userId: user.id,
        },
        {
          depth: 0,
          ancestorId: greatGrandChildFolder.id,
          descendantId: greatGrandChildFolder.id,
          userId: user.id,
        },
      ];
      expect(folderHierarchies).toHaveLength(expected.length);
      expect(folderHierarchies).toStrictEqual(expect.arrayContaining(expected));
    });
  });

  describe("when a folder has sibling folders", () => {
    it("set an order correctly", async () => {
      const user = await userFactory.create();
      const rootFolder = await folderFactory
        .vars({ user: () => user })
        .use((t) => t.root)
        .create();
      const child1Folder = await folderFactory
        .vars({ user: () => user })
        .use((t) => t.withAncestor(rootFolder))
        .create();
      const child2Folder = await folderFactory
        .vars({ user: () => user })
        .use((t) => t.withAncestor(rootFolder))
        .create();
      const grandChild1Folder = await folderFactory
        .vars({ user: () => user })
        .use((t) => t.withAncestor(child1Folder))
        .create();
      const grandChild2Folder = await folderFactory
        .vars({ user: () => user })
        .use((t) => t.withAncestor(child2Folder))
        .props({ order: () => 0 })
        .create();
      const grandChild3Folder = await folderFactory
        .vars({ user: () => user })
        .use((t) => t.withAncestor(child2Folder))
        .props({ order: () => 1 })
        .create();
      await moveFolder(db)({
        folderId: grandChild1Folder.id,
        ancestorId: child2Folder.id,
        userId: user.id,
        afterFolderId: grandChild2Folder.id,
      });
      const folder = await db.folder.findMany({
        select: {
          id: true,
          parentId: true,
          order: true,
        },
        where: {
          userId: user.id,
          parentId: child2Folder.id,
        },
        orderBy: {
          order: "asc",
        },
      });
      expect(folder).toStrictEqual([
        {
          id: grandChild2Folder.id,
          parentId: child2Folder.id,
          order: 0,
        },
        {
          id: grandChild1Folder.id,
          parentId: child2Folder.id,
          order: 1,
        },
        {
          id: grandChild3Folder.id,
          parentId: child2Folder.id,
          order: 2,
        },
      ]);
    });
  });

  describe("when a folder has sibling roots", () => {
    it("set an order correctly", async () => {
      const user = await userFactory.create();
      const rootFolder = await folderFactory
        .vars({ user: () => user })
        .use((t) => t.root)
        .create();
      const childFolder = await folderFactory
        .vars({ user: () => user })
        .use((t) => t.withAncestor(rootFolder))
        .create();
      await moveFolder(db)({
        folderId: childFolder.id,
        userId: user.id,
        afterFolderId: rootFolder.id,
        ancestorId: null,
      });
      const folder = await db.folder.findMany({
        select: {
          id: true,
          parentId: true,
          order: true,
        },
        where: {
          userId: user.id,
          parentId: null,
        },
        orderBy: {
          order: "asc",
        },
      });
      expect(folder).toStrictEqual([
        {
          id: rootFolder.id,
          parentId: null,
          order: 0,
        },
        {
          id: childFolder.id,
          parentId: null,
          order: 1,
        },
      ]);
    });
  });

  describe("when a folder moves to the same place", () => {
    it("moves a folder", async () => {
      const user = await userFactory.create();
      const rootFolder = await folderFactory
        .vars({ user: () => user })
        .use((t) => t.root)
        .create();
      const child1Folder = await folderFactory
        .props({ order: () => 0 })
        .vars({ user: () => user })
        .use((t) => t.withAncestor(rootFolder))
        .create();
      const child2Folder = await folderFactory
        .props({ order: () => 1 })
        .vars({ user: () => user })
        .use((t) => t.withAncestor(rootFolder))
        .create();
      await moveFolder(db)({
        folderId: child1Folder.id,
        ancestorId: rootFolder.id,
        userId: user.id,
        afterFolderId: child2Folder.id,
      });
      const folder = await db.folder.findMany({
        select: {
          id: true,
          parentId: true,
          order: true,
        },
        where: {
          userId: user.id,
        },
        orderBy: {
          order: "asc",
        },
      });
      expect(folder).toStrictEqual([
        {
          id: child2Folder.id,
          parentId: rootFolder.id,
          order: 0,
        },
        {
          id: child1Folder.id,
          parentId: rootFolder.id,
          order: 1,
        },
        {
          id: rootFolder.id,
          parentId: null,
          order: rootFolder.order,
        },
      ]);
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
        orderBy: { ancestorId: "asc" },
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
          descendantId: child1Folder.id,
          userId: user.id,
        },
        {
          depth: 2,
          ancestorId: null,
          descendantId: child2Folder.id,
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
          descendantId: child1Folder.id,
          userId: user.id,
        },
        {
          depth: 1,
          ancestorId: rootFolder.id,
          descendantId: child2Folder.id,
          userId: user.id,
        },
        {
          depth: 0,
          ancestorId: child1Folder.id,
          descendantId: child1Folder.id,
          userId: user.id,
        },
        {
          depth: 0,
          ancestorId: child2Folder.id,
          descendantId: child2Folder.id,
          userId: user.id,
        },
      ];
      expect(folderHierarchies).toHaveLength(expected.length);
      expect(folderHierarchies).toStrictEqual(expect.arrayContaining(expected));
    });
  });

  describe("when a folderId is the same as the ancestorId", () => {
    it("throws an error", async () => {
      const user = await userFactory.create();
      const rootFolder = await folderFactory
        .vars({ user: () => user })
        .use((t) => t.root)
        .create();
      await expect(
        moveFolder(db)({
          folderId: rootFolder.id,
          ancestorId: rootFolder.id,
          afterFolderId: rootFolder.id,
          userId: user.id,
        }),
      ).rejects.toThrow("The folder cannot move to the descendant folder.");
    });
  });

  describe("when a folder moves to the descendant folder", () => {
    it("throws an error", async () => {
      const user = await userFactory.create();
      const rootFolder = await folderFactory
        .vars({ user: () => user })
        .use((t) => t.root)
        .create();
      const childFolder = await folderFactory
        .vars({ user: () => user })
        .use((t) => t.withAncestor(rootFolder))
        .create();
      await expect(
        moveFolder(db)({
          folderId: rootFolder.id,
          ancestorId: childFolder.id,
          afterFolderId: null,
          userId: user.id,
        }),
      ).rejects.toThrow("The folder cannot move to the descendant folder.");
    });
  });

  describe("when the afterFolderId is another user's folder id", () => {
    it("throws an error", async () => {
      const user = await userFactory.create();
      const folder1 = await folderFactory.use((t) => t.root).create();
      const folder2 = await folderFactory
        .vars({ user: () => user })
        .use((t) => t.root)
        .create();
      await expect(
        moveFolder(db)({
          folderId: folder2.id,
          ancestorId: null,
          afterFolderId: folder1.id,
          userId: user.id,
        }),
      ).rejects.toThrow("The folder does not exist.");
    });
  });

  describe("when a user does not have the ancestor folder", () => {
    it("throws an error", async () => {
      const user = await userFactory.create();
      const rootFolder = await folderFactory.use((t) => t.root).create();
      const childFolder = await folderFactory
        .vars({ user: () => user })
        .use((t) => t.withAncestor(rootFolder))
        .create();
      await expect(
        moveFolder(db)({
          folderId: childFolder.id,
          ancestorId: rootFolder.id,
          afterFolderId: null,
          userId: user.id,
        }),
      ).rejects.toThrow("The ancestor folder does not exist.");
      await expect(
        db.folder.findMany({
          where: {
            userId: user.id,
          },
        }),
      ).resolves.toStrictEqual([childFolder]);
    });
  });

  describe("when a user does not have the folder", () => {
    it("throws an error", async () => {
      const user = await userFactory.create();
      const rootFolder = await folderFactory
        .vars({ user: () => user })
        .use((t) => t.root)
        .create();
      const childFolder = await folderFactory
        .use((t) => t.withAncestor(rootFolder))
        .create();
      await expect(
        moveFolder(db)({
          folderId: childFolder.id,
          ancestorId: rootFolder.id,
          afterFolderId: null,
          userId: user.id,
        }),
      ).rejects.toThrow("The folder does not exist.");
      await expect(
        db.folder.findMany({
          where: {
            userId: user.id,
          },
        }),
      ).resolves.toStrictEqual([rootFolder]);
    });
  });

  describe("when a another user's folder become a root", () => {
    it("throws an error", async () => {
      const user = await userFactory.create();
      const rootFolder = await folderFactory
        .vars({ user: () => user })
        .use((t) => t.root)
        .create();
      const childFolder = await folderFactory
        .use((t) => t.withAncestor(rootFolder))
        .create();
      await expect(
        moveFolder(db)({
          folderId: childFolder.id,
          ancestorId: null,
          afterFolderId: null,
          userId: user.id,
        }),
      ).rejects.toThrow("The folder does not exist.");
      await expect(
        db.folder.findMany({
          where: {
            userId: user.id,
          },
        }),
      ).resolves.toStrictEqual([rootFolder]);
    });
  });
});
