import {
  folderFactory,
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

describe("timeEntriesRouter", () => {
  describe("#getTimeEntries", () => {
    describe("when a user is not logged in", () => {
      it("throws an error", async () => {
        const caller = createCaller(
          createInnerContext({ db, currentUserId: undefined }),
        );
        await expect(caller.timeEntries.getTimeEntries({})).rejects.toThrow(
          new TRPCError({ code: "UNAUTHORIZED" }),
        );
      });
    });

    describe("when a user has timeEntries", () => {
      it("returns timeEntries", async () => {
        const user = await userFactory.create();
        const folder = await folderFactory.vars({ user: () => user }).create();
        const task = await taskFactory
          .vars({ user: () => user, folder: () => folder })
          .create();
        const timeEntry = await timeEntryFactory
          .vars({ task: () => task })
          .create();
        const caller = createCaller(
          createInnerContext({ db, currentUserId: user.id }),
        );
        await expect(
          caller.timeEntries.getTimeEntries({}),
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
                  color: folder.color,
                  createdAt: folder.createdAt,
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

    describe("when another user has timeEntries", () => {
      it("returns an empty items", async () => {
        const user = await userFactory.create();
        await timeEntryFactory.create();
        const caller = createCaller(
          createInnerContext({ db, currentUserId: user.id }),
        );
        await expect(
          caller.timeEntries.getTimeEntries({}),
        ).resolves.toStrictEqual({ items: [], nextCursor: undefined });
      });
    });
  });

  describe("#getTimeEntriesInTasks", () => {
    describe("when a user is not logged in", () => {
      it("throws an error", async () => {
        const caller = createCaller(
          createInnerContext({ db, currentUserId: undefined }),
        );
        const task = await taskFactory.create();
        await expect(
          caller.timeEntries.getTimeEntriesInTasks({ taskId: task.id }),
        ).rejects.toThrow(new TRPCError({ code: "UNAUTHORIZED" }));
      });
    });

    describe("when a user has timeEntries in the task", () => {
      it("returns timeEntries", async () => {
        const user = await userFactory.create();
        const task = await taskFactory.vars({ user: () => user }).create();
        const timeEntry = await timeEntryFactory
          .vars({ task: () => task })
          .create();
        const caller = createCaller(
          createInnerContext({ db, currentUserId: user.id }),
        );
        await expect(
          caller.timeEntries.getTimeEntriesInTasks({ taskId: task.id }),
        ).resolves.toStrictEqual([
          {
            duration: timeEntry.duration,
            id: timeEntry.id,
            startedAt: timeEntry.startedAt,
            stoppedAt: timeEntry.stoppedAt,
            taskId: timeEntry.taskId,
            createdAt: timeEntry.createdAt,
            updatedAt: timeEntry.updatedAt,
          },
        ]);
      });
    });

    describe("when another user has timeEntries", () => {
      it("returns an empty items", async () => {
        const user = await userFactory.create();
        const task = await taskFactory.create();
        const caller = createCaller(
          createInnerContext({ db, currentUserId: user.id }),
        );
        await expect(
          caller.timeEntries.getTimeEntriesInTasks({ taskId: task.id }),
        ).rejects.toThrow("The task does not exist.");
      });
    });
  });

  describe("#getCalendarTimeEntries", () => {
    describe("when a user is not logged in", () => {
      it("throws an error", async () => {
        const caller = createCaller(
          createInnerContext({ db, currentUserId: undefined }),
        );
        await expect(
          caller.timeEntries.getCalendarTimeEntries({
            startDate: parseISO("2024-01-01T00:00:00"),
            endDate: parseISO("2024-01-01T01:00:00"),
          }),
        ).rejects.toThrow(new TRPCError({ code: "UNAUTHORIZED" }));
      });
    });

    describe("when a user has timeEntries", () => {
      it("returns timeEntries", async () => {
        const user = await userFactory.create();
        const folder = await folderFactory.vars({ user: () => user }).create();
        const task = await taskFactory
          .vars({ user: () => user, folder: () => folder })
          .create();
        const timeEntry = await timeEntryFactory
          .props({
            startedAt: () => parseISO("2023-12-31T23:00:00"),
            stoppedAt: () => parseISO("2024-01-01T01:00:00"),
          })
          .vars({ task: () => task })
          .create();
        const caller = createCaller(
          createInnerContext({ db, currentUserId: user.id }),
        );
        await expect(
          caller.timeEntries.getCalendarTimeEntries({
            startDate: parseISO("2024-01-01T00:00:00"),
            endDate: parseISO("2024-01-01T01:00:00"),
          }),
        ).resolves.toStrictEqual([
          {
            duration: timeEntry.duration,
            id: timeEntry.id,
            startedAt: timeEntry.startedAt,
            stoppedAt: timeEntry.stoppedAt,
            taskId: timeEntry.taskId,
            task: {
              folder: {
                color: folder.color,
                createdAt: folder.createdAt,
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
        ]);
      });
    });

    describe("when another user has timeEntries", () => {
      it("returns an empty array", async () => {
        const user = await userFactory.create();
        await timeEntryFactory.create();
        const caller = createCaller(
          createInnerContext({ db, currentUserId: user.id }),
        );
        await expect(
          caller.timeEntries.getCalendarTimeEntries({
            startDate: parseISO("2024-01-01T00:00:00"),
            endDate: parseISO("2024-01-01T01:00:00"),
          }),
        ).resolves.toStrictEqual([]);
      });
    });
  });

  describe("#createTimeEntry", () => {
    describe("when a user is not logged in", () => {
      it("throws an error", async () => {
        const caller = createCaller(
          createInnerContext({ db, currentUserId: undefined }),
        );
        const folder = await folderFactory.create();
        await expect(
          caller.timeEntries.createTimeEntry({
            folderId: folder.id,
            description: "description",
            startedAt: parseISO("2024-01-01T00:00:00"),
            stoppedAt: parseISO("2024-01-01T01:00:00"),
          }),
        ).rejects.toThrow(new TRPCError({ code: "UNAUTHORIZED" }));
      });
    });

    describe("when a user has a folder", () => {
      it("creates the timeEntry", async () => {
        const user = await userFactory.create();
        const folder = await folderFactory.vars({ user: () => user }).create();
        await taskFactory
          .vars({ user: () => user })
          .props({ description: () => "description" })
          .create();
        const caller = createCaller(
          createInnerContext({ db, currentUserId: user.id }),
        );
        await expect(
          caller.timeEntries.createTimeEntry({
            folderId: folder.id,
            description: "description",
            startedAt: parseISO("2024-01-01T00:00:00"),
            stoppedAt: parseISO("2024-01-01T01:00:00"),
          }),
        ).resolves.toBeUndefined();
        await expect(
          db.timeEntry.findFirst({
            select: {
              startedAt: true,
              stoppedAt: true,
              task: {
                select: {
                  folderId: true,
                  description: true,
                  userId: true,
                },
              },
            },
            where: {
              startedAt: parseISO("2024-01-01T00:00:00"),
              stoppedAt: parseISO("2024-01-01T01:00:00"),
              task: {
                userId: user.id,
              },
            },
          }),
        ).resolves.toStrictEqual({
          startedAt: parseISO("2024-01-01T00:00:00"),
          stoppedAt: parseISO("2024-01-01T01:00:00"),
          task: {
            folderId: folder.id,
            description: "description",
            userId: user.id,
          },
        });
      });

      describe("when another user has a folder", () => {
        it("throws an error", async () => {
          const user = await userFactory.create();
          const folder = await folderFactory.create();
          await taskFactory
            .vars({ user: () => user })
            .props({ description: () => "description" })
            .create();
          const caller = createCaller(
            createInnerContext({ db, currentUserId: user.id }),
          );
          await expect(
            caller.timeEntries.createTimeEntry({
              folderId: folder.id,
              description: "description",
              startedAt: parseISO("2024-01-01T00:00:00"),
              stoppedAt: parseISO("2024-01-01T01:00:00"),
            }),
          ).rejects.toThrow("The folder does not exist.");
        });
      });
    });
  });

  describe("#updateTimeEntry", () => {
    describe("when a user is not logged in", () => {
      it("throws an error", async () => {
        const caller = createCaller(
          createInnerContext({ db, currentUserId: undefined }),
        );
        const timeEntry = await timeEntryFactory.create();
        await expect(
          caller.timeEntries.updateTimeEntry({
            id: timeEntry.id,
            startedAt: parseISO("2024-01-01T00:00:00"),
            stoppedAt: parseISO("2024-01-01T01:00:00"),
          }),
        ).rejects.toThrow(new TRPCError({ code: "UNAUTHORIZED" }));
      });
    });

    describe("when a user has a timeEntry", () => {
      it("updates the timeEntry", async () => {
        const user = await userFactory.create();
        const folder = await folderFactory.vars({ user: () => user }).create();
        const task = await taskFactory
          .vars({ user: () => user, folder: () => folder })
          .create();
        const timeEntry = await timeEntryFactory
          .vars({ task: () => task })
          .create();
        const caller = createCaller(
          createInnerContext({ db, currentUserId: user.id }),
        );
        await expect(
          caller.timeEntries.updateTimeEntry({
            id: timeEntry.id,
            startedAt: parseISO("2024-01-01T00:00:00"),
            stoppedAt: parseISO("2024-01-01T01:00:00"),
          }),
        ).resolves.toBeUndefined();
        await expect(
          db.timeEntry.findUnique({
            select: {
              id: true,
              startedAt: true,
              stoppedAt: true,
              taskId: true,
            },
            where: {
              id: timeEntry.id,
            },
          }),
        ).resolves.toStrictEqual({
          id: timeEntry.id,
          taskId: timeEntry.taskId,
          startedAt: parseISO("2024-01-01T00:00:00"),
          stoppedAt: parseISO("2024-01-01T01:00:00"),
        });
      });

      describe("when another user has timeEntries", () => {
        it("throws an error", async () => {
          const user = await userFactory.create();
          const timeEntry = await timeEntryFactory.create();
          const caller = createCaller(
            createInnerContext({ db, currentUserId: user.id }),
          );
          await expect(
            caller.timeEntries.updateTimeEntry({
              id: timeEntry.id,
              startedAt: parseISO("2024-01-01T00:00:00"),
              stoppedAt: parseISO("2024-01-01T01:00:00"),
            }),
          ).rejects.toThrow("The timeEntry does not exist.");
        });
      });
    });
  });

  describe("#deleteTimeEntry", () => {
    describe("when a user is not logged in", () => {
      it("throws an error", async () => {
        const timeEntry = await timeEntryFactory.create();
        const caller = createCaller(
          createInnerContext({ db, currentUserId: undefined }),
        );
        await expect(
          caller.timeEntries.deleteTimeEntry({
            id: timeEntry.id,
          }),
        ).rejects.toThrow(new TRPCError({ code: "UNAUTHORIZED" }));
      });
    });

    describe("when a user has the timeEntry", () => {
      it("deletes the chart", async () => {
        const user = await userFactory.create();
        const task = await taskFactory.vars({ user: () => user }).create();
        const timeEntry = await timeEntryFactory
          .vars({ task: () => task })
          .create();
        const caller = createCaller(
          createInnerContext({ db, currentUserId: user.id }),
        );
        await expect(
          caller.timeEntries.deleteTimeEntry({
            id: timeEntry.id,
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

    describe("when a user does not have the timeEntry", () => {
      it("throws an error", async () => {
        const user = await userFactory.create();
        const timeEntry = await timeEntryFactory.create();
        const caller = createCaller(
          createInnerContext({ db, currentUserId: user.id }),
        );
        await expect(
          caller.timeEntries.deleteTimeEntry({
            id: timeEntry.id,
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
});
