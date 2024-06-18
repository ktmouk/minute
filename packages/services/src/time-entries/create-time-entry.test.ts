import {
  folderFactory,
  taskFactory,
  userFactory,
} from "@minute/prisma/vitest/factories";
import { db } from "@minute/prisma/vitest/helpers";
import { parseISO } from "date-fns";
import { it, describe, vi, expect } from "vitest";
import { createTimeEntry } from "..";

vi.mock("server-only");

describe("createTimeEntry", () => {
  describe("when a user has a folder", () => {
    it("creates the timeEntry", async () => {
      const user = await userFactory.create();
      const folder = await folderFactory.vars({ user: () => user }).create();
      await taskFactory
        .vars({ user: () => user })
        .props({ description: () => "description" })
        .create();
      await expect(
        createTimeEntry(db)({
          userId: user.id,
          folderId: folder.id,
          description: "description",
          startedAt: parseISO("2024-01-01T01:00:00"),
          stoppedAt: parseISO("2024-01-01T02:00:00"),
        }),
      ).resolves.toBeUndefined();
      await expect(
        db.timeEntry.findFirst({
          select: {
            startedAt: true,
            stoppedAt: true,
            duration: true,
            task: {
              select: {
                folderId: true,
                description: true,
                userId: true,
              },
            },
          },
          where: {
            startedAt: parseISO("2024-01-01T01:00:00"),
            stoppedAt: parseISO("2024-01-01T02:00:00"),
            task: {
              userId: user.id,
            },
          },
        }),
      ).resolves.toStrictEqual({
        startedAt: parseISO("2024-01-01T01:00:00"),
        stoppedAt: parseISO("2024-01-01T02:00:00"),
        duration: 3600,
        task: {
          folderId: folder.id,
          description: "description",
          userId: user.id,
        },
      });
    });
  });

  describe("when another user has a folder", () => {
    it("does not create a timeEntry", async () => {
      const user = await userFactory.create();
      const folder = await folderFactory.create();
      await taskFactory
        .vars({ user: () => user })
        .props({ description: () => "description" })
        .create();
      await expect(
        createTimeEntry(db)({
          userId: user.id,
          folderId: folder.id,
          description: "description",
          startedAt: parseISO("2024-01-01T01:00:00"),
          stoppedAt: parseISO("2024-01-01T01:00:00"),
        }),
      ).rejects.toThrow("The folder does not exist.");
      await expect(
        db.timeEntry.findFirst({
          where: {
            task: {
              userId: user.id,
            },
          },
        }),
      ).resolves.toBeNull();
    });
  });

  describe("when the folderId and description are changed and a user already has the matched task", () => {
    it("updates the timeEntry and does not create a task", async () => {
      const user = await userFactory.create();
      const folder = await folderFactory.vars({ user: () => user }).create();
      const task = await taskFactory
        .vars({ user: () => user, folder: () => folder })
        .props({ description: () => "description" })
        .create();
      await expect(
        createTimeEntry(db)({
          userId: user.id,
          folderId: folder.id,
          description: "description",
          startedAt: parseISO("2024-01-01T01:00:00"),
          stoppedAt: parseISO("2024-01-01T02:00:00"),
        }),
      ).resolves.toBeUndefined();
      await expect(
        db.timeEntry.findFirst({
          select: {
            startedAt: true,
            stoppedAt: true,
            duration: true,
            task: {
              select: {
                id: true,
                userId: true,
              },
            },
          },
          where: {
            startedAt: parseISO("2024-01-01T01:00:00"),
            stoppedAt: parseISO("2024-01-01T02:00:00"),
            task: {
              userId: user.id,
            },
          },
        }),
      ).resolves.toStrictEqual({
        startedAt: parseISO("2024-01-01T01:00:00"),
        stoppedAt: parseISO("2024-01-01T02:00:00"),
        duration: 3600,
        task: {
          id: task.id,
          userId: user.id,
        },
      });
    });
  });

  describe("when the stoppedAt is less than the startedAt", () => {
    it("throws an error", async () => {
      const user = await userFactory.create();
      const folder = await folderFactory.vars({ user: () => user }).create();
      await expect(
        createTimeEntry(db)({
          userId: user.id,
          folderId: folder.id,
          description: "description",
          startedAt: parseISO("2024-01-01T02:00:00"),
          stoppedAt: parseISO("2024-01-01T01:00:00"),
        }),
      ).rejects.toThrow("The start time must be earlier than end time.");
    });
  });
});
