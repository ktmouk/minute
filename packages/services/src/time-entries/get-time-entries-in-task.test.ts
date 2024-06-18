import {
  taskFactory,
  timeEntryFactory,
  userFactory,
} from "@minute/prisma/vitest/factories";
import { db } from "@minute/prisma/vitest/helpers";
import { it, describe, vi, expect } from "vitest";
import { getTimeEntriesInTask } from "..";

vi.mock("server-only");

describe("getTimeEntriesInTask", () => {
  describe("when a user has a timeEntry", () => {
    it("returns timeEntries", async () => {
      const user = await userFactory.create();
      const task = await taskFactory.vars({ user: () => user }).create();
      const timeEntry = await timeEntryFactory
        .vars({ task: () => task })
        .create();
      await expect(
        getTimeEntriesInTask(db)({
          taskId: task.id,
          userId: user.id,
        }),
      ).resolves.toStrictEqual([
        {
          duration: timeEntry.duration,
          id: timeEntry.id,
          startedAt: timeEntry.startedAt,
          stoppedAt: timeEntry.stoppedAt,
          taskId: timeEntry.taskId,
          createdAt: timeEntry.createdAt,
          updatedAt: timeEntry.updatedAt,
        },
      ]);
    });
  });

  describe("when a user has multiple timeEntries", () => {
    it("returns timeEntries", async () => {
      const user = await userFactory.create();
      const task = await taskFactory.vars({ user: () => user }).create();
      await timeEntryFactory.vars({ task: () => task }).createList(3);
      await expect(
        getTimeEntriesInTask(db)({
          taskId: task.id,
          userId: user.id,
        }),
      ).resolves.toHaveLength(3);
    });
  });

  describe("when another user has timeEntries", () => {
    it("returns an empty items", async () => {
      const user = await userFactory.create();
      const task = await taskFactory.create();
      await timeEntryFactory.vars({ task: () => task }).createList(3);
      await expect(
        getTimeEntriesInTask(db)({
          taskId: task.id,
          userId: user.id,
        }),
      ).rejects.toThrow("The task does not exist.");
    });
  });
});
