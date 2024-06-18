import {
  folderFactory,
  runningTimeEntryFactory,
  userFactory,
} from "@minute/prisma/vitest/factories";
import { db } from "@minute/prisma/vitest/helpers";
import { parseISO } from "date-fns";
import { it, describe, vi, expect } from "vitest";
import { updateRunningTimeEntry } from "..";

vi.mock("server-only");

describe("updateRunningTimeEntry", () => {
  describe("when a user does not have a runningTimeEntry", () => {
    it("does not create a runningTimeEntry", async () => {
      const user = await userFactory.create();
      await expect(
        updateRunningTimeEntry(db)({
          userId: user.id,
          description: "description",
          startedAt: parseISO("2024-01-01T01:23:45"),
        }),
      ).rejects.toThrow("The timer is not running.");
      expect(
        await db.runningTimeEntry.findUnique({
          where: {
            userId: user.id,
          },
        }),
      ).toBeNull();
    });
  });

  describe("when a user has a runningTimeEntry", () => {
    it("updates the runningTimeEntry", async () => {
      const user = await userFactory.create();
      const runningTimeEntry = await runningTimeEntryFactory
        .vars({ user: () => user })
        .create();
      await expect(
        updateRunningTimeEntry(db)({
          userId: user.id,
          description: "description",
          startedAt: parseISO("2024-01-01T01:23:45"),
        }),
      ).resolves.toBeUndefined();
      await expect(
        db.runningTimeEntry.findUnique({
          select: {
            description: true,
            folderId: true,
            id: true,
            startedAt: true,
            userId: true,
          },
          where: {
            id: runningTimeEntry.id,
          },
        }),
      ).resolves.toStrictEqual({
        description: "description",
        folderId: runningTimeEntry.folderId,
        id: runningTimeEntry.id,
        startedAt: parseISO("2024-01-01T01:23:45"),
        userId: user.id,
      });
    });
  });

  describe("when a user has a folder", () => {
    it("updates the runningTimeEntry", async () => {
      const user = await userFactory.create();
      const folder = await folderFactory.vars({ user: () => user }).create();
      const runningTimeEntry = await runningTimeEntryFactory
        .vars({ user: () => user })
        .create();
      await expect(
        updateRunningTimeEntry(db)({
          userId: user.id,
          folderId: folder.id,
          description: "description",
          startedAt: parseISO("2024-01-01T01:23:45"),
        }),
      ).resolves.toBeUndefined();
      await expect(
        db.runningTimeEntry.findUnique({
          select: {
            folderId: true,
          },
          where: {
            id: runningTimeEntry.id,
          },
        }),
      ).resolves.toStrictEqual({
        folderId: folder.id,
      });
    });
  });

  describe("when another user has a runningTimeEntry", () => {
    it("does not update another user's runningTimeEntry", async () => {
      const user = await userFactory.create();
      const runningTimeEntry = await runningTimeEntryFactory.create();
      await expect(
        updateRunningTimeEntry(db)({
          userId: user.id,
          description: "description",
          startedAt: parseISO("2024-01-01T01:23:45"),
        }),
      ).rejects.toThrow("The timer is not running.");
      expect(
        await db.runningTimeEntry.findUnique({
          where: {
            id: runningTimeEntry.id,
          },
        }),
      ).toStrictEqual(runningTimeEntry);
    });
  });

  describe("when another user has a folder", () => {
    it("does not update another user's runningTimeEntry", async () => {
      const user = await userFactory.create();
      const folder = await folderFactory.create();
      const runningTimeEntry = await runningTimeEntryFactory
        .vars({ user: () => user })
        .create();
      await expect(
        updateRunningTimeEntry(db)({
          userId: user.id,
          folderId: folder.id,
          description: "description",
          startedAt: parseISO("2024-01-01T01:23:45"),
        }),
      ).rejects.toThrow("The folder does not exist.");
      expect(
        await db.runningTimeEntry.findUnique({
          where: {
            id: runningTimeEntry.id,
          },
        }),
      ).toStrictEqual(runningTimeEntry);
    });
  });
});
