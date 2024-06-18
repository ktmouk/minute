import { taskFactory, userFactory } from "@minute/prisma/vitest/factories";
import { db } from "@minute/prisma/vitest/helpers";
import { it, describe, vi, expect } from "vitest";
import { getSuggestionTasks } from "..";

vi.mock("server-only");

describe("getSuggestionTasks", () => {
  describe("when a user has matched tasks", () => {
    it("returns tasks", async () => {
      const user = await userFactory.create();
      const task = await taskFactory
        .props({ description: () => "abc" })
        .vars({ user: () => user })
        .create();
      await expect(
        getSuggestionTasks(db)({
          description: "ab",
          userId: user.id,
        }),
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

  describe("when a user does not have matched tasks", () => {
    it("returns tasks", async () => {
      const user = await userFactory.create();
      await taskFactory
        .props({ description: () => "def" })
        .vars({ user: () => user })
        .create();
      await expect(
        getSuggestionTasks(db)({
          description: "ab",
          userId: user.id,
        }),
      ).resolves.toStrictEqual([]);
    });
  });

  describe("when another user has matched tasks", () => {
    it("returns an empty items", async () => {
      const user = await userFactory.create();
      await taskFactory.props({ description: () => "abc" }).create();
      await expect(
        getSuggestionTasks(db)({
          description: "ab",
          userId: user.id,
        }),
      ).resolves.toStrictEqual([]);
    });
  });

  describe("when a description has '%'", () => {
    it("escapes char", async () => {
      const user = await userFactory.create();
      await taskFactory
        .props({ description: () => "a" })
        .vars({ user: () => user })
        .create();
      const task = await taskFactory
        .props({ description: () => "%a%" })
        .vars({ user: () => user })
        .create();
      await expect(
        getSuggestionTasks(db)({
          description: "%",
          userId: user.id,
        }),
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

  describe("when a description has '_'", () => {
    it("escapes char", async () => {
      const user = await userFactory.create();
      await taskFactory
        .props({ description: () => "a" })
        .vars({ user: () => user })
        .create();
      const task = await taskFactory
        .props({ description: () => "_a" })
        .vars({ user: () => user })
        .create();
      await expect(
        getSuggestionTasks(db)({
          description: "_",
          userId: user.id,
        }),
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

  describe("when a description has multiple '%'", () => {
    it("escapes char", async () => {
      const user = await userFactory.create();
      await taskFactory
        .props({ description: () => "aaa" })
        .vars({ user: () => user })
        .create();
      const task = await taskFactory
        .props({ description: () => "___a" })
        .vars({ user: () => user })
        .create();
      await expect(
        getSuggestionTasks(db)({
          description: "___",
          userId: user.id,
        }),
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

  describe("when a description has the slash", () => {
    it("escapes char", async () => {
      const user = await userFactory.create();
      await taskFactory
        .props({ description: () => "_" })
        .vars({ user: () => user })
        .create();
      const task = await taskFactory
        .props({ description: () => "\\_a" })
        .vars({ user: () => user })
        .create();
      await expect(
        getSuggestionTasks(db)({
          description: "\\_",
          userId: user.id,
        }),
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
});
