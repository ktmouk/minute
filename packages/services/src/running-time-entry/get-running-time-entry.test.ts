import {
  runningTimeEntryFactory,
  userFactory,
} from "@minute/prisma/vitest/factories";
import { db } from "@minute/prisma/vitest/helpers";
import { it, describe, vi, expect } from "vitest";
import { getRunningTimeEntry } from "./get-running-time-entry";

vi.mock("server-only");

describe("getRunningTimeEntry", () => {
  describe("when a user does not have a runningTimeEntry", () => {
    it("returns undefined", async () => {
      const user = await userFactory.create();
      await expect(
        getRunningTimeEntry(db)({
          userId: user.id,
        }),
      ).resolves.toBeNull();
    });
  });

  describe("when a user has a runningTimeEntry", () => {
    it("returns the runningTimeEntry", async () => {
      const user = await userFactory.create();
      const runningTimeEntry = await runningTimeEntryFactory
        .vars({ user: () => user })
        .create();
      await expect(
        getRunningTimeEntry(db)({
          userId: user.id,
        }),
      ).resolves.toStrictEqual(runningTimeEntry);
    });
  });

  describe("when another user has a runningTimeEntry", () => {
    it("returns undefined", async () => {
      const user = await userFactory.create();
      await runningTimeEntryFactory.create();
      await expect(
        getRunningTimeEntry(db)({
          userId: user.id,
        }),
      ).resolves.toBeNull();
    });
  });
});
