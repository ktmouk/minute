import {
  folderFactory,
  taskFactory,
  userFactory,
} from "@minute/prisma/vitest/factories";
import { db } from "@minute/prisma/vitest/helpers";
import { TRPCError } from "@trpc/server";
import { it, describe, vi, expect } from "vitest";
import { createInnerContext } from "../context";
import { createCaller } from ".";

vi.mock("server-only");

describe("tasksRouter", () => {
  describe("#getTasksInFolder", () => {
    describe("when a user is not logged in", () => {
      it("throws an error", async () => {
        const caller = createCaller(
          createInnerContext({ db, currentUserId: undefined }),
        );
        const folder = await folderFactory.create();
        await expect(
          caller.tasks.getTasksInFolder({ folderId: folder.id }),
        ).rejects.toThrow(new TRPCError({ code: "UNAUTHORIZED" }));
      });
    });

    describe("when a user has tasks", () => {
      it("returns tasks", async () => {
        const user = await userFactory.create();
        const folder = await folderFactory.vars({ user: () => user }).create();
        const task = await taskFactory
          .vars({ user: () => user, folder: () => folder })
          .create();
        const caller = createCaller(
          createInnerContext({ db, currentUserId: user.id }),
        );
        await expect(
          caller.tasks.getTasksInFolder({ folderId: folder.id }),
        ).resolves.toStrictEqual([
          {
            createdAt: task.createdAt,
            description: task.description,
            folderId: task.folderId,
            id: task.id,
            updatedAt: task.updatedAt,
            userId: task.userId,
          },
        ]);
      });
    });

    describe("when another user has tasks", () => {
      it("returns an empty items", async () => {
        const user = await userFactory.create();
        const folder = await folderFactory.create();
        await taskFactory
          .vars({ user: () => user, folder: () => folder })
          .create();
        const caller = createCaller(
          createInnerContext({ db, currentUserId: user.id }),
        );
        await expect(
          caller.tasks.getTasksInFolder({ folderId: folder.id }),
        ).rejects.toThrow("The folder does not exist.");
      });
    });
  });

  describe("#getSuggestionTasks", () => {
    describe("when a user is not logged in", () => {
      it("throws an error", async () => {
        const caller = createCaller(
          createInnerContext({ db, currentUserId: undefined }),
        );
        await expect(
          caller.tasks.getSuggestionTasks({ description: "" }),
        ).rejects.toThrow(new TRPCError({ code: "UNAUTHORIZED" }));
      });
    });

    describe("when a user has tasks", () => {
      it("returns tasks", async () => {
        const user = await userFactory.create();
        const task = await taskFactory
          .props({ description: () => "abc" })
          .vars({ user: () => user })
          .create();
        const caller = createCaller(
          createInnerContext({ db, currentUserId: user.id }),
        );
        await expect(
          caller.tasks.getSuggestionTasks({ description: "abc" }),
        ).resolves.toStrictEqual([
          {
            createdAt: task.createdAt,
            description: task.description,
            folderId: task.folderId,
            id: task.id,
            updatedAt: task.updatedAt,
            userId: task.userId,
          },
        ]);
      });
    });

    describe("when another user has tasks", () => {
      it("returns an empty array", async () => {
        const user = await userFactory.create();
        await taskFactory.props({ description: () => "abc" }).create();
        const caller = createCaller(
          createInnerContext({ db, currentUserId: user.id }),
        );
        await expect(
          caller.tasks.getSuggestionTasks({ description: "abc" }),
        ).resolves.toStrictEqual([]);
      });
    });
  });

  describe("#moveTask", () => {
    describe("when a user is not logged in", () => {
      it("throws an error", async () => {
        const task = await taskFactory.create();
        const folder = await folderFactory.create();
        const caller = createCaller(
          createInnerContext({ db, currentUserId: undefined }),
        );
        await expect(
          caller.tasks.moveTask({
            id: task.id,
            folderId: folder.id,
          }),
        ).rejects.toThrow(new TRPCError({ code: "UNAUTHORIZED" }));
      });
    });

    describe("when a user has a task and a folder", () => {
      it("moves the task", async () => {
        const user = await userFactory.create();
        const task = await taskFactory.vars({ user: () => user }).create();
        const folder = await folderFactory.vars({ user: () => user }).create();
        const caller = createCaller(
          createInnerContext({ db, currentUserId: user.id }),
        );
        await expect(
          caller.tasks.moveTask({
            id: task.id,
            folderId: folder.id,
          }),
        ).resolves.toBeUndefined();
        await expect(
          db.task.findFirst({
            select: {
              id: true,
              userId: true,
              folderId: true,
            },
            where: {
              userId: user.id,
            },
          }),
        ).resolves.toStrictEqual({
          id: task.id,
          userId: user.id,
          folderId: folder.id,
        });
      });
    });

    describe("when a user does not has a task", () => {
      it("throws an error", async () => {
        const user = await userFactory.create();
        const task = await taskFactory.create();
        const folder = await folderFactory.vars({ user: () => user }).create();
        const caller = createCaller(
          createInnerContext({ db, currentUserId: user.id }),
        );
        await expect(
          caller.tasks.moveTask({
            id: task.id,
            folderId: folder.id,
          }),
        ).rejects.toThrow("The task does not exist.");
        await expect(
          db.task.findFirst({
            where: {
              id: task.id,
            },
          }),
        ).resolves.toStrictEqual(task);
      });
    });

    describe("when a user does not has a folder", () => {
      it("throws an error", async () => {
        const user = await userFactory.create();
        const task = await taskFactory.vars({ user: () => user }).create();
        const folder = await folderFactory.create();
        const caller = createCaller(
          createInnerContext({ db, currentUserId: user.id }),
        );
        await expect(
          caller.tasks.moveTask({
            id: task.id,
            folderId: folder.id,
          }),
        ).rejects.toThrow("The folder does not exist.");
        await expect(
          db.task.findFirst({
            where: {
              id: task.id,
            },
          }),
        ).resolves.toStrictEqual(task);
      });
    });
  });

  describe("#deleteTask", () => {
    describe("when a user is not logged in", () => {
      it("throws an error", async () => {
        const task = await taskFactory.create();
        const caller = createCaller(
          createInnerContext({ db, currentUserId: undefined }),
        );
        await expect(
          caller.tasks.deleteTask({
            id: task.id,
          }),
        ).rejects.toThrow(new TRPCError({ code: "UNAUTHORIZED" }));
      });
    });

    describe("when a user has the task", () => {
      it("deletes the task", async () => {
        const user = await userFactory.create();
        const task = await taskFactory.vars({ user: () => user }).create();
        const caller = createCaller(
          createInnerContext({ db, currentUserId: user.id }),
        );
        await expect(
          caller.tasks.deleteTask({
            id: task.id,
          }),
        ).resolves.toBeUndefined();
        await expect(
          db.task.findFirst({
            where: {
              userId: user.id,
            },
          }),
        ).resolves.toBeNull();
      });
    });

    describe("when a user does not have a task", () => {
      it("throws an error", async () => {
        const user = await userFactory.create();
        const task = await taskFactory.create();
        const caller = createCaller(
          createInnerContext({ db, currentUserId: user.id }),
        );
        await expect(
          caller.tasks.deleteTask({
            id: task.id,
          }),
        ).rejects.toThrow("The task does not exist.");
        await expect(
          db.task.findFirst({
            where: {
              id: task.id,
            },
          }),
        ).resolves.toStrictEqual(task);
      });
    });
  });

  describe("#updateTask", () => {
    describe("when a user is not logged in", () => {
      it("throws an error", async () => {
        const task = await taskFactory.create();
        const caller = createCaller(
          createInnerContext({ db, currentUserId: undefined }),
        );
        await expect(
          caller.tasks.updateTask({
            id: task.id,
            description: "description",
          }),
        ).rejects.toThrow(new TRPCError({ code: "UNAUTHORIZED" }));
      });
    });

    describe("when it is called", () => {
      it("updates a folder", async () => {
        const user = await userFactory.create();
        const task = await taskFactory.vars({ user: () => user }).create();
        const caller = createCaller(
          createInnerContext({ db, currentUserId: user.id }),
        );
        await expect(
          caller.tasks.updateTask({
            id: task.id,
            description: "description",
          }),
        ).resolves.toBeUndefined();
        await expect(
          db.task.findFirst({
            select: {
              id: true,
              userId: true,
              description: true,
            },
            where: {
              userId: user.id,
            },
          }),
        ).resolves.toStrictEqual({
          id: task.id,
          userId: user.id,
          description: "description",
        });
      });
    });

    describe("when another user has a folder", () => {
      it("throws an error", async () => {
        const user = await userFactory.create();
        const task = await taskFactory.create();
        const caller = createCaller(
          createInnerContext({ db, currentUserId: user.id }),
        );
        await expect(
          caller.tasks.updateTask({
            id: task.id,
            description: "description",
          }),
        ).rejects.toThrow("The task does not exist.");
      });
    });
  });
});
