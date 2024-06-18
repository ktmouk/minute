import {
  folderFactory,
  taskFactory,
  timeEntryFactory,
  userFactory,
} from "@minute/prisma/vitest/factories";
import { db } from "@minute/prisma/vitest/helpers";
import { it, describe, vi, expect } from "vitest";
import { deleteFolder } from "./delete-folder";

vi.mock("server-only");

describe("deleteFolder", () => {
  describe("when a user has the folder", () => {
    it("deletes the folder and subFolders and related models", async () => {
      const user = await userFactory.create();
      const rootFolder = await folderFactory
        .vars({ user: () => user })
        .use((t) => t.root)
        .create();
      const rootTask = await taskFactory
        .vars({ user: () => user, folder: () => rootFolder })
        .create();
      const rootTimeEntry = await timeEntryFactory
        .vars({ task: () => rootTask })
        .create();
      const childFolder = await folderFactory
        .vars({ user: () => user })
        .use((t) => t.withAncestor(rootFolder))
        .create();
      const childTask = await taskFactory
        .vars({ user: () => user, folder: () => childFolder })
        .create();
      const childTimeEntry = await timeEntryFactory
        .vars({ task: () => childTask })
        .create();
      const grandChildFolder = await folderFactory
        .vars({ user: () => user })
        .use((t) => t.withAncestor(childFolder))
        .create();
      const grandChildTask = await taskFactory
        .vars({ user: () => user, folder: () => grandChildFolder })
        .create();
      const grandChildTimeEntry = await timeEntryFactory
        .vars({ task: () => grandChildTask })
        .create();
      await expect(
        deleteFolder(db)({
          id: childFolder.id,
          userId: user.id,
        }),
      ).resolves.toBeUndefined();
      await expect(
        db.folder.findMany({
          where: {
            id: {
              in: [rootFolder.id, childFolder.id, grandChildFolder.id],
            },
          },
        }),
      ).resolves.toStrictEqual([rootFolder]);
      await expect(
        db.task.findMany({
          where: {
            id: {
              in: [rootTask.id, childTask.id, grandChildTask.id],
            },
          },
        }),
      ).resolves.toStrictEqual([rootTask]);
      await expect(
        db.timeEntry.findMany({
          where: {
            id: {
              in: [rootTimeEntry.id, childTimeEntry.id, grandChildTimeEntry.id],
            },
          },
        }),
      ).resolves.toStrictEqual([rootTimeEntry]);
    });
  });

  describe("when another user has the folder", () => {
    it("throws an error", async () => {
      const user1 = await userFactory.create();
      const user2 = await userFactory.create();
      const folder = await folderFactory
        .vars({ user: () => user2 })
        .use((t) => t.root)
        .create();
      const task = await taskFactory
        .vars({ user: () => user2, folder: () => folder })
        .create();
      const timeEntry = await timeEntryFactory
        .vars({ task: () => task })
        .create();
      await expect(
        deleteFolder(db)({
          id: folder.id,
          userId: user1.id,
        }),
      ).rejects.toThrow("The folder does not exist.");
      await expect(
        db.folder.findFirst({
          where: {
            id: folder.id,
          },
        }),
      ).resolves.toStrictEqual(folder);
      await expect(
        db.task.findFirst({
          where: {
            id: task.id,
          },
        }),
      ).resolves.toStrictEqual(task);
      await expect(
        db.timeEntry.findFirst({
          where: {
            id: timeEntry.id,
          },
        }),
      ).resolves.toStrictEqual(timeEntry);
    });
  });
});
