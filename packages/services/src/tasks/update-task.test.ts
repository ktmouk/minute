import { taskFactory, userFactory } from "@minute/prisma/vitest/factories";
import { db } from "@minute/prisma/vitest/helpers";
import { it, describe, vi, expect } from "vitest";
import { updateTask } from "./update-task";

vi.mock("server-only");

describe("updateTask", () => {
  describe("when a user has the task", () => {
    it("updates the task", async () => {
      const user = await userFactory.create();
      const task = await taskFactory.vars({ user: () => user }).create();
      await expect(
        updateTask(db)({
          id: task.id,
          userId: user.id,
          description: "description",
        }),
      ).resolves.toBeUndefined();
      await expect(
        db.task.findUnique({
          select: {
            id: true,
            userId: true,
            description: true,
          },
          where: {
            id: task.id,
          },
        }),
      ).resolves.toStrictEqual({
        id: task.id,
        userId: user.id,
        description: "description",
      });
    });
  });

  describe("when another user has the task", () => {
    it("does not update the task", async () => {
      const user = await userFactory.create();
      const task = await taskFactory.create();
      await expect(
        updateTask(db)({
          id: task.id,
          userId: user.id,
          description: "description",
        }),
      ).rejects.toThrow("The task does not exist.");
      await expect(
        db.task.findUnique({
          where: {
            id: task.id,
          },
        }),
      ).resolves.toStrictEqual(task);
    });
  });
});
