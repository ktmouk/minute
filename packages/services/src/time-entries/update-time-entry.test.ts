import {
  folderFactory,
  taskFactory,
  timeEntryFactory,
  userFactory,
} from "@minute/prisma/vitest/factories";
import { db } from "@minute/prisma/vitest/helpers";
import { parseISO } from "date-fns";
import { it, describe, vi, expect } from "vitest";
import { updateTimeEntry } from "..";

vi.mock("server-only");

describe("updateTimeEntry", () => {
  describe("when a user has a timeEntry", () => {
    it("updates the timeEntry", async () => {
      const user = await userFactory.create();
      const task = await taskFactory.vars({ user: () => user }).create();
      const timeEntry = await timeEntryFactory
        .vars({ task: () => task })
        .create();
      await expect(
        updateTimeEntry(db)({
          userId: user.id,
          id: timeEntry.id,
          startedAt: parseISO("2024-01-01T01:00:00"),
          stoppedAt: parseISO("2024-01-01T02:00:00"),
        }),
      ).resolves.toBeUndefined();
      await expect(
        db.timeEntry.findUnique({
          select: {
            id: true,
            startedAt: true,
            stoppedAt: true,
            taskId: true,
            duration: true,
          },
          where: {
            id: timeEntry.id,
          },
        }),
      ).resolves.toStrictEqual({
        id: timeEntry.id,
        taskId: timeEntry.taskId,
        startedAt: parseISO("2024-01-01T01:00:00"),
        stoppedAt: parseISO("2024-01-01T02:00:00"),
        duration: 3600,
      });
    });
  });

  describe("when another user has a timeEntry", () => {
    it("does not update another user's timeEntry", async () => {
      const user = await userFactory.create();
      const task = await taskFactory.create();
      const timeEntry = await timeEntryFactory
        .vars({ task: () => task })
        .create();
      await expect(
        updateTimeEntry(db)({
          userId: user.id,
          id: timeEntry.id,
          startedAt: parseISO("2024-01-01T01:23:45"),
          stoppedAt: parseISO("2024-01-01T01:23:45"),
        }),
      ).rejects.toThrow("The timeEntry does not exist.");
      await expect(
        db.timeEntry.findUnique({
          where: {
            id: timeEntry.id,
          },
        }),
      ).resolves.toStrictEqual(timeEntry);
    });
  });

  describe("when another user has a folder", () => {
    it("does not update another user's timeEntry", async () => {
      const user = await userFactory.create();
      const folder = await folderFactory.create();
      const task = await taskFactory.vars({ user: () => user }).create();
      const timeEntry = await timeEntryFactory
        .vars({ task: () => task })
        .create();
      await expect(
        updateTimeEntry(db)({
          userId: user.id,
          id: timeEntry.id,
          folderId: folder.id,
          startedAt: parseISO("2024-01-01T01:23:45"),
          stoppedAt: parseISO("2024-01-02T01:23:45"),
        }),
      ).rejects.toThrow("The folder does not exist.");
      await expect(
        db.timeEntry.findUnique({
          where: {
            id: timeEntry.id,
          },
        }),
      ).resolves.toStrictEqual(timeEntry);
    });
  });

  describe("when the folderId is changed", () => {
    it("updates the timeEntry and creates a task", async () => {
      const user = await userFactory.create();
      const folder = await folderFactory.vars({ user: () => user }).create();
      const task = await taskFactory.vars({ user: () => user }).create();
      await taskFactory
        .vars({ user: () => user, folder: () => folder })
        .create();
      const timeEntry = await timeEntryFactory
        .vars({ task: () => task })
        .create();
      await expect(
        updateTimeEntry(db)({
          userId: user.id,
          id: timeEntry.id,
          folderId: folder.id,
          startedAt: parseISO("2024-01-01T01:00:00"),
          stoppedAt: parseISO("2024-01-01T02:00:00"),
        }),
      ).resolves.toBeUndefined();
      const updatedTimeEntry = await db.timeEntry.findUnique({
        select: {
          id: true,
          startedAt: true,
          stoppedAt: true,
          duration: true,
          task: {
            select: {
              id: true,
              folderId: true,
              description: true,
              userId: true,
            },
          },
        },
        where: {
          id: timeEntry.id,
        },
      });
      expect(updatedTimeEntry).toStrictEqual({
        id: timeEntry.id,
        startedAt: parseISO("2024-01-01T01:00:00"),
        stoppedAt: parseISO("2024-01-01T02:00:00"),
        duration: 3600,
        task: {
          id: expect.any(String) as unknown,
          description: task.description,
          folderId: folder.id,
          userId: user.id,
        },
      });
      expect(updatedTimeEntry?.task.id).not.toBe(task.id);
    });
  });

  describe("when the description is changed", () => {
    it("updates the timeEntry and creates a task", async () => {
      const user = await userFactory.create();
      const folder = await folderFactory.vars({ user: () => user }).create();
      const task1 = await taskFactory.vars({ user: () => user }).create();
      await taskFactory
        .vars({ user: () => user })
        .props({ description: () => "description" })
        .create();
      const timeEntry = await timeEntryFactory
        .vars({ task: () => task1 })
        .create();
      await expect(
        updateTimeEntry(db)({
          userId: user.id,
          id: timeEntry.id,
          folderId: folder.id,
          description: "description",
          startedAt: parseISO("2024-01-01T01:00:00"),
          stoppedAt: parseISO("2024-01-01T02:00:00"),
        }),
      ).resolves.toBeUndefined();
      const updatedTimeEntry = await db.timeEntry.findUnique({
        select: {
          id: true,
          startedAt: true,
          stoppedAt: true,
          duration: true,
          task: {
            select: {
              id: true,
              folderId: true,
              description: true,
              userId: true,
            },
          },
        },
        where: {
          id: timeEntry.id,
        },
      });
      expect(updatedTimeEntry).toStrictEqual({
        id: timeEntry.id,
        startedAt: parseISO("2024-01-01T01:00:00"),
        stoppedAt: parseISO("2024-01-01T02:00:00"),
        duration: 3600,
        task: {
          id: expect.any(String) as unknown,
          description: "description",
          folderId: folder.id,
          userId: user.id,
        },
      });
      expect(updatedTimeEntry?.task.id).not.toBe(task1.id);
    });
  });

  describe("when the folderId and description are changed and a user already has the matched task", () => {
    it("updates the timeEntry and does not create a task", async () => {
      const user = await userFactory.create();
      const folder = await folderFactory.vars({ user: () => user }).create();
      const task1 = await taskFactory.vars({ user: () => user }).create();
      const task2 = await taskFactory
        .vars({ user: () => user, folder: () => folder })
        .props({ description: () => "description" })
        .create();
      const timeEntry = await timeEntryFactory
        .vars({ task: () => task1 })
        .create();
      await expect(
        updateTimeEntry(db)({
          userId: user.id,
          id: timeEntry.id,
          folderId: folder.id,
          description: "description",
          startedAt: parseISO("2024-01-01T01:00:00"),
          stoppedAt: parseISO("2024-01-01T02:00:00"),
        }),
      ).resolves.toBeUndefined();
      await expect(
        db.timeEntry.findUnique({
          select: {
            id: true,
            startedAt: true,
            stoppedAt: true,
            duration: true,
            task: {
              select: {
                id: true,
                userId: true,
              },
            },
          },
          where: {
            id: timeEntry.id,
          },
        }),
      ).resolves.toStrictEqual({
        id: timeEntry.id,
        startedAt: parseISO("2024-01-01T01:00:00"),
        stoppedAt: parseISO("2024-01-01T02:00:00"),
        duration: 3600,
        task: {
          id: task2.id,
          userId: user.id,
        },
      });
    });
  });

  describe("when the stoppedAt is less than the startedAt", () => {
    it("throws an error", async () => {
      const user = await userFactory.create();
      const task = await taskFactory.vars({ user: () => user }).create();
      const timeEntry = await timeEntryFactory
        .vars({ task: () => task })
        .create();
      await expect(
        updateTimeEntry(db)({
          userId: user.id,
          id: timeEntry.id,
          startedAt: parseISO("2024-01-02T01:23:45"),
          stoppedAt: parseISO("2024-01-01T01:23:45"),
        }),
      ).rejects.toThrow("The start time must be earlier than end time.");
      await expect(
        db.timeEntry.findUnique({
          where: {
            id: timeEntry.id,
          },
        }),
      ).resolves.toStrictEqual(timeEntry);
    });
  });

  describe("when the stoppedAt is changed and is less than the startedAt", () => {
    it("throws an error", async () => {
      const user = await userFactory.create();
      const task = await taskFactory.vars({ user: () => user }).create();
      const timeEntry = await timeEntryFactory
        .vars({ task: () => task })
        .props({ startedAt: () => parseISO("2024-01-02T01:23:45") })
        .create();
      await expect(
        updateTimeEntry(db)({
          userId: user.id,
          id: timeEntry.id,
          stoppedAt: parseISO("2024-01-01T01:23:45"),
        }),
      ).rejects.toThrow("The start time must be earlier than end time.");
      await expect(
        db.timeEntry.findUnique({
          where: {
            id: timeEntry.id,
          },
        }),
      ).resolves.toStrictEqual(timeEntry);
    });
  });

  describe("when the startedAt is changed and is greater than the stoppedAt", () => {
    it("throws an error", async () => {
      const user = await userFactory.create();
      const task = await taskFactory.vars({ user: () => user }).create();
      const timeEntry = await timeEntryFactory
        .vars({ task: () => task })
        .props({ stoppedAt: () => parseISO("2024-01-01T01:23:45") })
        .create();
      await expect(
        updateTimeEntry(db)({
          userId: user.id,
          id: timeEntry.id,
          startedAt: parseISO("2024-01-02T01:23:45"),
        }),
      ).rejects.toThrow("The start time must be earlier than end time.");
      await expect(
        db.timeEntry.findUnique({
          where: {
            id: timeEntry.id,
          },
        }),
      ).resolves.toStrictEqual(timeEntry);
    });
  });
});
