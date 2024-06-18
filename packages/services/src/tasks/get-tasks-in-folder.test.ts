import {
  folderFactory,
  taskFactory,
  userFactory,
} from "@minute/prisma/vitest/factories";
import { db } from "@minute/prisma/vitest/helpers";
import { it, describe, vi, expect } from "vitest";
import { getTasksInFolder } from "..";

vi.mock("server-only");

describe("getTasksInFolder", () => {
  describe("when a user has tasks", () => {
    it("returns tasks", async () => {
      const user = await userFactory.create();
      const task = await taskFactory.vars({ user: () => user }).create();
      await expect(
        getTasksInFolder(db)({
          folderId: task.folderId,
          userId: user.id,
        }),
      ).resolves.toStrictEqual([
        {
          createdAt: task.createdAt,
          description: task.description,
          folderId: task.folderId,
          id: task.id,
          updatedAt: task.updatedAt,
          userId: task.userId,
        },
      ]);
    });
  });

  describe("when a user has multiple tasks in the folder", () => {
    it("returns timeEntries", async () => {
      const user = await userFactory.create();
      const folder = await folderFactory.vars({ user: () => user }).create();
      await taskFactory
        .vars({ folder: () => folder, user: () => user })
        .createList(3);
      await expect(
        getTasksInFolder(db)({
          folderId: folder.id,
          userId: user.id,
        }),
      ).resolves.toHaveLength(3);
    });
  });

  describe("when a user does not have tasks in the folder", () => {
    it("returns timeEntries", async () => {
      const user = await userFactory.create();
      const folder = await folderFactory.vars({ user: () => user }).create();
      await taskFactory.vars({ user: () => user }).create();
      await expect(
        getTasksInFolder(db)({
          folderId: folder.id,
          userId: user.id,
        }),
      ).resolves.toStrictEqual([]);
    });
  });

  describe("when another user has a folder", () => {
    it("returns an empty items", async () => {
      const user = await userFactory.create();
      const folder = await folderFactory.create();
      await taskFactory
        .vars({ folder: () => folder, user: () => user })
        .create();
      await expect(
        getTasksInFolder(db)({
          folderId: folder.id,
          userId: user.id,
        }),
      ).rejects.toThrow("The folder does not exist.");
    });
  });
});
