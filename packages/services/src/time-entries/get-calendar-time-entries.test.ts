import {
  folderFactory,
  taskFactory,
  timeEntryFactory,
  userFactory,
} from "@minute/prisma/vitest/factories";
import { db } from "@minute/prisma/vitest/helpers";
import { parseISO } from "date-fns";
import { it, describe, vi, expect } from "vitest";
import { getCalendarTimeEntries } from "..";

vi.mock("server-only");

describe("getCalendarTimeEntries", () => {
  describe("when a user has a timeEntry in the range", () => {
    it("returns timeEntries", async () => {
      const user = await userFactory.create();
      const folder = await folderFactory.vars({ user: () => user }).create();
      const task = await taskFactory
        .vars({ user: () => user, folder: () => folder })
        .create();
      const timeEntry = await timeEntryFactory
        .props({
          startedAt: () => parseISO("2023-12-31T23:00:00"),
          stoppedAt: () => parseISO("2024-01-01T01:00:00"),
        })
        .vars({ task: () => task })
        .create();
      await expect(
        getCalendarTimeEntries(db)({
          userId: user.id,
          startDate: parseISO("2024-01-01T00:00:00"),
          endDate: parseISO("2024-01-01T23:59:59"),
        }),
      ).resolves.toStrictEqual([
        {
          duration: timeEntry.duration,
          id: timeEntry.id,
          startedAt: timeEntry.startedAt,
          stoppedAt: timeEntry.stoppedAt,
          taskId: timeEntry.taskId,
          task: {
            folder: {
              createdAt: folder.createdAt,
              color: folder.color,
              emoji: folder.emoji,
              id: folder.id,
              name: folder.name,
              parentId: null,
              order: folder.order,
              updatedAt: folder.updatedAt,
              userId: user.id,
            },
            id: task.id,
            description: task.description,
            folderId: task.folderId,
            createdAt: task.createdAt,
            updatedAt: task.updatedAt,
            userId: user.id,
          },
          createdAt: timeEntry.createdAt,
          updatedAt: timeEntry.updatedAt,
        },
      ]);
    });
  });

  describe("when a user does not have a timeEntry in the range", () => {
    it("returns an empty array", async () => {
      const user = await userFactory.create();
      const folder = await folderFactory.vars({ user: () => user }).create();
      const task = await taskFactory
        .vars({ user: () => user, folder: () => folder })
        .create();
      await timeEntryFactory
        .props({
          startedAt: () => parseISO("2023-12-31T22:00:00"),
          stoppedAt: () => parseISO("2023-12-31T23:59:59"),
        })
        .vars({ task: () => task })
        .create();
      await timeEntryFactory
        .props({
          startedAt: () => parseISO("2024-01-02T00:00:00"),
          stoppedAt: () => parseISO("2024-01-02T01:00:00"),
        })
        .vars({ task: () => task })
        .create();
      await expect(
        getCalendarTimeEntries(db)({
          userId: user.id,
          startDate: parseISO("2024-01-01T00:00:00"),
          endDate: parseISO("2024-01-01T23:59:59"),
        }),
      ).resolves.toStrictEqual([]);
    });
  });

  describe("when a user has multiple timeEntries", () => {
    it("returns timeEntries", async () => {
      const user = await userFactory.create();
      const task = await taskFactory.vars({ user: () => user }).create();
      await timeEntryFactory
        .props({
          startedAt: () => parseISO("2024-01-01T00:00:00"),
          stoppedAt: () => parseISO("2024-01-01T00:00:00"),
        })
        .vars({ task: () => task })
        .create();
      await timeEntryFactory
        .props({
          startedAt: () => parseISO("2024-01-01T23:59:59"),
          stoppedAt: () => parseISO("2024-01-01T23:59:59"),
        })
        .vars({ task: () => task })
        .create();
      expect(
        await getCalendarTimeEntries(db)({
          userId: user.id,
          startDate: parseISO("2024-01-01T00:00:00"),
          endDate: parseISO("2024-01-01T23:59:59"),
        }),
      ).toHaveLength(2);
    });
  });

  describe("when another user has timeEntries", () => {
    it("returns an empty items", async () => {
      const user = await userFactory.create();
      await timeEntryFactory
        .props({
          startedAt: () => parseISO("2023-12-31T23:00:00"),
          stoppedAt: () => parseISO("2024-01-01T01:00:00"),
        })
        .create();
      await expect(
        getCalendarTimeEntries(db)({
          userId: user.id,
          startDate: parseISO("2024-01-01T00:00:00"),
          endDate: parseISO("2024-01-01T23:59:59"),
        }),
      ).resolves.toStrictEqual([]);
    });
  });

  describe("when startDate and endDate are invalid", () => {
    it("throws an error", async () => {
      const user = await userFactory.create();
      const task = await taskFactory.create();
      await timeEntryFactory.vars({ task: () => task }).createList(3);
      await expect(
        getCalendarTimeEntries(db)({
          userId: user.id,
          startDate: parseISO("2024-01-01T23:59:59"),
          endDate: parseISO("2024-01-01T00:00:00"),
        }),
      ).rejects.toThrow("The startDate must be earlier than startDate.");
    });
  });
});
