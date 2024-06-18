import {
  taskFactory,
  timeEntryFactory,
  userFactory,
} from "@minute/prisma/vitest/factories";
import { db } from "@minute/prisma/vitest/helpers";
import { parseISO } from "date-fns";
import { it, describe, vi, expect } from "vitest";
import { getTotalTimeEntryDuration } from "./get-total-time-entry-duration";

vi.mock("server-only");

describe("getTotalTimeEntryDuration", () => {
  describe("when a user has timeEntries", () => {
    it("returns the total duration", async () => {
      const user = await userFactory.create();
      const task1 = await taskFactory.vars({ user: () => user }).create();
      const task2 = await taskFactory.vars({ user: () => user }).create();
      const task3 = await taskFactory.create();
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
      await timeEntryFactory
        .vars({ task: () => task3 })
        .props({
          duration: () => 100,
          startedAt: () => parseISO("2024-01-01T01:00:00"),
        })
        .createList(3);
      await expect(
        getTotalTimeEntryDuration(db)({
          userId: user.id,
        }),
      ).resolves.toBe(500);
    });

    describe("when a user does not have timeEntries", () => {
      it("returns zero", async () => {
        const user = await userFactory.create();
        const task = await taskFactory.create();
        await timeEntryFactory
          .vars({ task: () => task })
          .props({
            duration: () => 100,
            startedAt: () => parseISO("2024-01-01T01:00:00"),
          })
          .createList(3);
        await expect(
          getTotalTimeEntryDuration(db)({
            userId: user.id,
          }),
        ).resolves.toBe(0);
      });
    });
  });
});
