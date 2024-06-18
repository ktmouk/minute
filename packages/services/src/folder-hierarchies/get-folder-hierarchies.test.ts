import {
  folderHierarchyFactory,
  userFactory,
} from "@minute/prisma/vitest/factories";
import { db } from "@minute/prisma/vitest/helpers";
import { it, describe, vi, expect } from "vitest";
import { getFolderHierarchies } from "..";

vi.mock("server-only");

describe("getFolderHierarchies", () => {
  describe("when a user has folderHierarchies", () => {
    it("returns folderHierarchies whose depth is 1", async () => {
      const user = await userFactory.create();
      const folderHierarchy = await folderHierarchyFactory
        .props({ depth: () => 1 })
        .vars({ user: () => user })
        .create();
      await expect(
        getFolderHierarchies(db)({
          userId: user.id,
        }),
      ).resolves.toStrictEqual([
        {
          ancestorId: folderHierarchy.ancestorId,
          depth: 1,
          descendantId: folderHierarchy.descendantId,
          id: folderHierarchy.id,
          createdAt: folderHierarchy.createdAt,
          updatedAt: folderHierarchy.updatedAt,
          userId: user.id,
        },
      ]);
    });
  });

  describe("when a user has folderHierarchies whose depth is not 1", () => {
    it("returns folderHierarchies whose depth is 1", async () => {
      const user = await userFactory.create();
      await folderHierarchyFactory
        .props({ depth: () => 0 })
        .vars({ user: () => user })
        .create();
      await expect(
        getFolderHierarchies(db)({
          userId: user.id,
        }),
      ).resolves.toStrictEqual([]);
    });
  });

  describe("when a user has multiple folderHierarchies", () => {
    it("returns folderHierarchies", async () => {
      const user = await userFactory.create();
      await folderHierarchyFactory
        .props({ depth: () => 1 })
        .vars({ user: () => user })
        .createList(3);
      await expect(
        getFolderHierarchies(db)({
          userId: user.id,
        }),
      ).resolves.toHaveLength(3);
    });
  });

  describe("when another user has folderHierarchies", () => {
    it("returns an empty items", async () => {
      const user = await userFactory.create();
      await folderHierarchyFactory.props({ depth: () => 1 }).createList(3);
      await expect(
        getFolderHierarchies(db)({
          userId: user.id,
        }),
      ).resolves.toStrictEqual([]);
    });
  });
});
