import {
  taskFactory,
  userFactory,
  timeEntryFactory,
  folderFactory,
} from "@minute/prisma/vitest/factories";
import { db } from "@minute/prisma/vitest/helpers";
import { it, describe, vi, expect } from "vitest";
import { deleteTask } from "./delete-task";

vi.mock("server-only");

describe("deleteTask", () => {
  describe("when a user has the task", () => {
    it("deletes the task and its items and does not delete a folder", async () => {
      const user = await userFactory.create();
      const folder = await folderFactory.vars({ user: () => user }).create();
      const task = await taskFactory
        .vars({ user: () => user, folder: () => folder })
        .create();
      const timeEntries = await timeEntryFactory
        .vars({ task: () => task })
        .createList(3);
      await expect(
        deleteTask(db)({
          id: task.id,
          userId: user.id,
        }),
      ).resolves.toBeUndefined();
      await expect(
        db.folder.findFirst({
          where: {
            id: task.folderId,
          },
        }),
      ).resolves.toStrictEqual(folder);
      await expect(
        db.task.findFirst({
          where: {
            id: task.id,
          },
        }),
      ).resolves.toBeNull();
      await expect(
        db.timeEntry.findMany({
          where: {
            id: { in: timeEntries.map(({ id }) => id) },
          },
        }),
      ).resolves.toStrictEqual([]);
    });
  });

  describe("when a user does not have the task", () => {
    it("throws an error", async () => {
      const user = await userFactory.create();
      const task = await taskFactory.create();
      await expect(
        deleteTask(db)({
          id: task.id,
          userId: user.id,
        }),
      ).rejects.toThrow("The task does not exist.");
      await expect(
        db.task.findFirst({
          where: {
            id: task.id,
          },
        }),
      ).resolves.toStrictEqual(task);
    });
  });
});
