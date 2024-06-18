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

describe("totalTimeEntryDurationRouter", () => {
  describe("#getTotalTimeEntryDuration", () => {
    describe("when a user is not logged in", () => {
      it("throws an error", async () => {
        const caller = createCaller(
          createInnerContext({ db, currentUserId: undefined }),
        );
        await expect(
          caller.totalTimeEntryDuration.getTotalTimeEntryDuration(),
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
          caller.totalTimeEntryDuration.getTotalTimeEntryDuration(),
        ).resolves.toBe(500);
      });
    });

    describe("when a user does not have timeEntries", () => {
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
          caller.totalTimeEntryDuration.getTotalTimeEntryDuration(),
        ).resolves.toBe(0);
      });
    });
  });
});
