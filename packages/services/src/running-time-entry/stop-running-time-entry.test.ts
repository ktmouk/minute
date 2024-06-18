import {
  folderFactory,
  runningTimeEntryFactory,
  taskFactory,
  userFactory,
} from "@minute/prisma/vitest/factories";
import { db } from "@minute/prisma/vitest/helpers";
import { parseISO } from "date-fns";
import { it, describe, vi, expect } from "vitest";
import { stopRunningTimeEntry } from "./stop-running-time-entry";

vi.mock("server-only");

describe("stopRunningTimeEntry", () => {
  describe("when a user does not have a runningTimeEntry", () => {
    it("throws an error", async () => {
      const user = await userFactory.create();
      await expect(
        stopRunningTimeEntry(db)({
          userId: user.id,
          stoppedAt: parseISO("2024-01-01T01:23:45"),
        }),
      ).rejects.toThrow("The timer is not running.");
    });
  });

  describe("when a user has a runningTimeEntry", () => {
    it("removes the runningTimeEntry and creates a task and timeEntry", async () => {
      const user = await userFactory.create();
      const runningTimeEntry = await runningTimeEntryFactory
        .props({ startedAt: () => parseISO("2024-01-01T01:23:45") })
        .vars({ user: () => user })
        .create();
      await stopRunningTimeEntry(db)({
        userId: user.id,
        stoppedAt: parseISO("2024-01-01T02:23:45"),
      });
      const task = await db.task.findFirstOrThrow({
        select: {
          id: true,
          userId: true,
          description: true,
          folderId: true,
        },
        where: {
          folderId: runningTimeEntry.folderId,
        },
      });
      expect(task).toStrictEqual({
        id: expect.any(String) as unknown,
        userId: user.id,
        description: runningTimeEntry.description,
        folderId: runningTimeEntry.folderId,
      });
      await expect(
        db.timeEntry.findFirst({
          select: {
            startedAt: true,
            stoppedAt: true,
            duration: true,
          },
          where: {
            taskId: task.id,
          },
        }),
      ).resolves.toStrictEqual({
        startedAt: parseISO("2024-01-01T01:23:45"),
        stoppedAt: parseISO("2024-01-01T02:23:45"),
        duration: 3600,
      });
      await expect(
        db.runningTimeEntry.findUnique({
          where: {
            id: runningTimeEntry.id,
          },
        }),
      ).resolves.toBeNull();
    });
  });

  describe("when a user has a task with the same description as the runningTimeEntry", () => {
    it("adds the timeEntry to the task", async () => {
      const user = await userFactory.create();
      const folder = await folderFactory.vars({ user: () => user }).create();
      const task = await taskFactory
        .props({ description: () => "description" })
        .vars({ folder: () => folder, user: () => user })
        .create();
      await runningTimeEntryFactory
        .props({
          description: () => "description",
          startedAt: () => parseISO("2024-01-01T01:23:45"),
        })
        .vars({ folder: () => folder, user: () => user })
        .create();
      await stopRunningTimeEntry(db)({
        userId: user.id,
        stoppedAt: parseISO("2024-01-01T02:23:45"),
      });
      await expect(
        db.timeEntry.findMany({
          select: {
            startedAt: true,
            stoppedAt: true,
            duration: true,
          },
          where: {
            taskId: task.id,
          },
        }),
      ).resolves.toStrictEqual([
        {
          duration: 3600,
          startedAt: parseISO("2024-01-01T01:23:45"),
          stoppedAt: parseISO("2024-01-01T02:23:45"),
        },
      ]);
    });
  });

  describe("when a user has a task with the same description as the runningTimeEntry in another folder", () => {
    it("creates the new task", async () => {
      const user = await userFactory.create();
      const folder = await folderFactory.vars({ user: () => user }).create();
      const task = await taskFactory
        .props({ description: () => "description" })
        .vars({ user: () => user })
        .create();
      await runningTimeEntryFactory
        .props({
          description: () => "description",
          startedAt: () => parseISO("2024-01-01T01:23:45"),
        })
        .vars({ folder: () => folder, user: () => user })
        .create();
      await stopRunningTimeEntry(db)({
        userId: user.id,
        stoppedAt: parseISO("2024-01-01T02:23:45"),
      });
      await expect(
        db.timeEntry.findMany({
          where: {
            taskId: task.id,
          },
        }),
      ).resolves.toStrictEqual([]);
    });
  });

  describe("when another user has a task with the same description as the runningTimeEntry", () => {
    it("creates the new task", async () => {
      const user = await userFactory.create();
      const folder = await folderFactory.vars({ user: () => user }).create();
      const task = await taskFactory
        .props({ description: () => "description" })
        .create();
      await runningTimeEntryFactory
        .props({
          description: () => "description",
          startedAt: () => parseISO("2024-01-01T01:23:45"),
        })
        .vars({ folder: () => folder, user: () => user })
        .create();
      await stopRunningTimeEntry(db)({
        userId: user.id,
        stoppedAt: parseISO("2024-01-01T02:23:45"),
      });
      await expect(
        db.timeEntry.findMany({
          where: {
            taskId: task.id,
          },
        }),
      ).resolves.toStrictEqual([]);
    });
  });

  describe("when the stoppedAt is less than the startedAt", () => {
    it("throws an error", async () => {
      const user = await userFactory.create();
      const runningTimeEntry = await runningTimeEntryFactory
        .props({ startedAt: () => parseISO("2024-01-01T01:23:46") })
        .vars({ user: () => user })
        .create();
      await expect(
        stopRunningTimeEntry(db)({
          userId: user.id,
          stoppedAt: parseISO("2024-01-01T01:23:45"),
        }),
      ).rejects.toThrow("The start time must be earlier than end time.");
      await expect(
        db.runningTimeEntry.findUnique({
          select: {
            id: true,
          },
          where: {
            id: runningTimeEntry.id,
          },
        }),
      ).resolves.toStrictEqual({
        id: runningTimeEntry.id,
      });
    });
  });

  describe("when the stoppedAt equals to the startedAt", () => {
    it("creates a timeEntry", async () => {
      const user = await userFactory.create();
      const runningTimeEntry = await runningTimeEntryFactory
        .props({ startedAt: () => parseISO("2024-01-01T01:23:45") })
        .vars({ user: () => user })
        .create();
      await stopRunningTimeEntry(db)({
        userId: user.id,
        stoppedAt: parseISO("2024-01-01T01:23:45"),
      });
      await expect(
        db.timeEntry.findFirst({
          select: {
            duration: true,
          },
          where: {
            task: {
              folderId: runningTimeEntry.folderId,
            },
          },
        }),
      ).resolves.toStrictEqual({
        duration: 0,
      });
    });
  });
});
