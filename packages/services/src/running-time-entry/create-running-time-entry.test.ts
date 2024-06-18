import {
  folderFactory,
  runningTimeEntryFactory,
  userFactory,
} from "@minute/prisma/vitest/factories";
import { db } from "@minute/prisma/vitest/helpers";
import { parseISO } from "date-fns";
import { it, describe, vi, expect } from "vitest";
import { createRunningTimeEntry } from "./create-running-time-entry";

vi.mock("server-only");

describe("createRunningTimeEntry", () => {
  describe("when a user does not have a runningTimeEntry", () => {
    it("creates a runningTimeEntry", async () => {
      const user = await userFactory.create();
      const folder = await folderFactory.vars({ user: () => user }).create();
      await expect(
        createRunningTimeEntry(db)({
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
            description: true,
            startedAt: true,
            userId: true,
          },
          where: {
            userId: user.id,
          },
        }),
      ).resolves.toStrictEqual({
        description: "description",
        folderId: folder.id,
        startedAt: parseISO("2024-01-01T01:23:45"),
        userId: user.id,
      });
    });
  });

  describe("when a user does not have a folder", () => {
    it("throws an error", async () => {
      const user = await userFactory.create();
      const folder = await folderFactory.create();
      await expect(
        createRunningTimeEntry(db)({
          userId: user.id,
          folderId: folder.id,
          description: "description",
          startedAt: parseISO("2024-01-01T01:23:45"),
        }),
      ).rejects.toThrow("The folder does not exist.");
      await expect(
        db.runningTimeEntry.findUnique({
          where: {
            userId: user.id,
          },
        }),
      ).resolves.toBeNull();
    });
  });

  describe("when a user has a runningTimeEntry", () => {
    it("throws an error", async () => {
      const user = await userFactory.create();
      const folder = await folderFactory.vars({ user: () => user }).create();
      const runningTimeEntry = await runningTimeEntryFactory
        .vars({ user: () => user })
        .create();
      await expect(
        createRunningTimeEntry(db)({
          userId: user.id,
          folderId: folder.id,
          description: "description",
          startedAt: parseISO("2024-01-01T01:23:45"),
        }),
      ).rejects.toThrow("The timer is already started.");
      await expect(
        db.runningTimeEntry.findUnique({
          select: {
            id: true,
          },
          where: {
            userId: user.id,
          },
        }),
      ).resolves.toStrictEqual({
        id: runningTimeEntry.id,
      });
    });
  });
});
