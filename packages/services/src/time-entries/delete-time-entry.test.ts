import {
  taskFactory,
  timeEntryFactory,
  userFactory,
} from "@minute/prisma/vitest/factories";
import { db } from "@minute/prisma/vitest/helpers";
import { it, describe, vi, expect } from "vitest";
import { deleteTimeEntry } from "./delete-time-entry";

vi.mock("server-only");

describe("deleteTimeEntry", () => {
  describe("when a user has the timeEntry", () => {
    it("deletes the timeEntry", async () => {
      const user = await userFactory.create();
      const task = await taskFactory.vars({ user: () => user }).create();
      const timeEntry = await timeEntryFactory
        .vars({ task: () => task })
        .create();
      await expect(
        deleteTimeEntry(db)({
          id: timeEntry.id,
          userId: user.id,
        }),
      ).resolves.toBeUndefined();
      await expect(
        db.timeEntry.findFirst({
          where: {
            id: timeEntry.id,
          },
        }),
      ).resolves.toBeNull();
    });
  });

  describe("when a user does not have the chart", () => {
    it("throws an error", async () => {
      const user = await userFactory.create();
      const timeEntry = await timeEntryFactory.create();
      await expect(
        deleteTimeEntry(db)({
          id: timeEntry.id,
          userId: user.id,
        }),
      ).rejects.toThrow("The timeEntry does not exist.");
      await expect(
        db.timeEntry.findFirst({
          where: {
            id: timeEntry.id,
          },
        }),
      ).resolves.toStrictEqual(timeEntry);
    });
  });
});
