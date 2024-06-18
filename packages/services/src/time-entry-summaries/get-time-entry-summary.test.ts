import {
  taskFactory,
  timeEntryFactory,
  userFactory,
} from "@minute/prisma/vitest/factories";
import { db } from "@minute/prisma/vitest/helpers";
import { parseISO } from "date-fns";
import { it, describe, vi, expect } from "vitest";
import { getTimeEntrySummary } from "./get-time-entry-summary";

vi.mock("server-only");

describe("getTimeEntrySummary", () => {
  describe("when a user has timeEntries", () => {
    it("returns a summary", async () => {
      const user = await userFactory.create();
      const task1 = await taskFactory.vars({ user: () => user }).create();
      const task2 = await taskFactory.vars({ user: () => user }).create();
      await timeEntryFactory
        .vars({ task: () => task1 })
        .props({
          duration: () => 100,
          startedAt: () => parseISO("2024-01-01T01:00:00"),
        })
        .createList(3);
      await timeEntryFactory
        .vars({ task: () => task2 })
        .props({
          duration: () => 100,
          startedAt: () => parseISO("2024-01-01T01:00:00"),
        })
        .createList(2);
      const timeEntrySummary = await getTimeEntrySummary(db)({
        userId: user.id,
        date: parseISO("2024-01-01T00:00:00"),
      });
      expect(timeEntrySummary).toStrictEqual(
        expect.arrayContaining([
          {
            folderId: task1.folderId,
            duration: 300n,
          },
          {
            folderId: task2.folderId,
            duration: 200n,
          },
        ]),
      );
    });
  });

  describe("when a user has task that has no tasks", () => {
    it("returns an empty array", async () => {
      const user = await userFactory.create();
      await taskFactory.vars({ user: () => user }).create();
      const timeEntrySummary = await getTimeEntrySummary(db)({
        userId: user.id,
        date: parseISO("2024-01-01T00:00:00"),
      });
      expect(timeEntrySummary).toStrictEqual([]);
    });
  });

  describe("when another user has timeEntries", () => {
    it("returns an empty array", async () => {
      const user = await userFactory.create();
      const task = await taskFactory.create();
      await timeEntryFactory
        .vars({ task: () => task })
        .props({
          duration: () => 100,
          startedAt: () => parseISO("2024-01-01T01:00:00"),
        })
        .createList(3);
      const timeEntrySummary = await getTimeEntrySummary(db)({
        userId: user.id,
        date: parseISO("2024-01-01T00:00:00"),
      });
      expect(timeEntrySummary).toStrictEqual([]);
    });
  });
});
