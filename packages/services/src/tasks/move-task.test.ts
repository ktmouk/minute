import {
  folderFactory,
  taskFactory,
  userFactory,
} from "@minute/prisma/vitest/factories";
import { db } from "@minute/prisma/vitest/helpers";
import { it, describe, vi, expect } from "vitest";
import { moveTask } from "./move-task";

vi.mock("server-only");

describe("moveTask", () => {
  describe("when a user has a task and a folder", () => {
    it("moves the task", async () => {
      const user = await userFactory.create();
      const task = await taskFactory.vars({ user: () => user }).create();
      const folder = await folderFactory.vars({ user: () => user }).create();
      await expect(
        moveTask(db)({
          id: task.id,
          userId: user.id,
          folderId: folder.id,
        }),
      ).resolves.toBeUndefined();
      await expect(
        db.task.findFirst({
          select: {
            userId: true,
            folderId: true,
          },
          where: {
            id: task.id,
          },
        }),
      ).resolves.toStrictEqual({
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
      await expect(
        moveTask(db)({
          id: task.id,
          userId: user.id,
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
      await expect(
        moveTask(db)({
          id: task.id,
          userId: user.id,
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
