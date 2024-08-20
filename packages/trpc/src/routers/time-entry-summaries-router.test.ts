import {
  taskFactory,
  timeEntryFactory,
  userFactory,
} from "@minute/prisma/vitest/factories";
import { db } from "@minute/prisma/vitest/helpers";
import { TRPCError } from "@trpc/server";
import { parseISO } from "date-fns";
import { it, describe, vi, expect } from "vitest";
import { createInnerContext } from "../context";
import { createCaller } from ".";

vi.mock("server-only");

describe("timeEntrySummariesRouter", () => {
  describe("#getTimeEntrySummary", () => {
    describe("when a user is not logged in", () => {
      it("throws an error", async () => {
        const caller = createCaller(
          createInnerContext({ db, currentUserId: undefined }),
        );
        await expect(
          caller.timeEntrySummaries.getTimeEntrySummary({
            startDate: parseISO("2024-01-01T00:00:00"),
            endDate: parseISO("2024-01-01T23:59:59"),
          }),
        ).rejects.toThrow(new TRPCError({ code: "UNAUTHORIZED" }));
      });
    });

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
        const caller = createCaller(
          createInnerContext({ db, currentUserId: user.id }),
        );
        await expect(
          caller.timeEntrySummaries.getTimeEntrySummary({
            startDate: parseISO("2024-01-01T00:00:00"),
            endDate: parseISO("2024-01-01T23:59:59"),
          }),
        ).resolves.toStrictEqual(
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

    describe("when another user has timeEntries", () => {
      it("returns an empty items", async () => {
        const user = await userFactory.create();
        await timeEntryFactory.create();
        const caller = createCaller(
          createInnerContext({ db, currentUserId: user.id }),
        );
        const task = await taskFactory.create();
        await timeEntryFactory
          .vars({ task: () => task })
          .props({
            duration: () => 100,
            startedAt: () => parseISO("2024-01-01T01:00:00"),
          })
          .createList(3);
        await expect(
          caller.timeEntrySummaries.getTimeEntrySummary({
            startDate: parseISO("2024-01-01T00:00:00"),
            endDate: parseISO("2024-01-01T23:59:59"),
          }),
        ).resolves.toStrictEqual([]);
      });
    });
  });
});
