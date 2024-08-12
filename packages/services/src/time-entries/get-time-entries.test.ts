import { seq } from "@factory-js/factory";
import {
  folderFactory,
  taskFactory,
  timeEntryFactory,
  userFactory,
} from "@minute/prisma/vitest/factories";
import { db } from "@minute/prisma/vitest/helpers";
import { addDays } from "date-fns";
import { it, describe, vi, expect } from "vitest";
import { getTimeEntries } from "..";

vi.mock("server-only");

describe("getTimeEntries", () => {
  describe("when a user has a timeEntry", () => {
    it("returns timeEntries", async () => {
      const user = await userFactory.create();
      const folder = await folderFactory.vars({ user: () => user }).create();
      const task = await taskFactory
        .vars({ user: () => user, folder: () => folder })
        .create();
      const timeEntry = await timeEntryFactory
        .vars({ task: () => task })
        .create();
      await expect(
        getTimeEntries(db)({
          userId: user.id,
        }),
      ).resolves.toStrictEqual({
        items: [
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
        ],
        nextCursor: undefined,
      });
    });
  });

  describe("when a user has multiple timeEntries", () => {
    it("returns timeEntries", async () => {
      const user = await userFactory.create();
      const task = await taskFactory.vars({ user: () => user }).create();
      await timeEntryFactory.vars({ task: () => task }).createList(3);
      expect(
        (
          await getTimeEntries(db)({
            userId: user.id,
          })
        ).items,
      ).toHaveLength(3);
    });
  });

  describe("when a user has many timeEntries", () => {
    it("returns the next cursor", async () => {
      const user = await userFactory.create();
      const task = await taskFactory.vars({ user: () => user }).create();
      const now = new Date();
      const timeEntries = await timeEntryFactory
        .vars({ task: () => task })
        .props({ startedAt: seq(1, (i) => addDays(now, -i)) })
        .createList(30);
      const { nextCursor } = await getTimeEntries(db)({
        userId: user.id,
      });
      expect(nextCursor).not.toBeUndefined();
      expect(nextCursor?.id).toBe(timeEntries[25]?.id);
      const { items } = await getTimeEntries(db)({
        userId: user.id,
        cursor: nextCursor,
      });
      expect(items.map(({ id }) => id)).toStrictEqual(
        timeEntries.slice(25).map(({ id }) => id),
      );
    });
  });

  describe("when another user has timeEntries", () => {
    it("returns an empty items", async () => {
      const user = await userFactory.create();
      await timeEntryFactory.createList(3);
      await expect(
        getTimeEntries(db)({
          userId: user.id,
        }),
      ).resolves.toStrictEqual({
        items: [],
        nextCursor: undefined,
      });
    });
  });

  describe("when the next cursor is for another user", () => {
    it("returns an empty items", async () => {
      const user = await userFactory.create();
      const timeEntry = await timeEntryFactory.create();
      await timeEntryFactory.createList(10);
      await expect(
        getTimeEntries(db)({
          userId: user.id,
          cursor: {
            id: timeEntry.id,
            startedAt: timeEntry.startedAt,
          },
        }),
      ).resolves.toStrictEqual({
        items: [],
        nextCursor: undefined,
      });
    });
  });
});
