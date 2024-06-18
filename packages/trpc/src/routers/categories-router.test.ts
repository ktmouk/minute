import {
  categoryFactory,
  categoryFolderFactory,
  folderFactory,
  userFactory,
} from "@minute/prisma/vitest/factories";
import { db } from "@minute/prisma/vitest/helpers";
import { TRPCError } from "@trpc/server";
import { it, describe, vi, expect } from "vitest";
import { createInnerContext } from "../context";
import { createCaller } from ".";

vi.mock("server-only");

describe("categoriesRouter", () => {
  describe("#getAllCategories", () => {
    describe("when a user is not logged in", () => {
      it("throws an error", async () => {
        const caller = createCaller(
          createInnerContext({ db, currentUserId: undefined }),
        );
        await expect(caller.categories.getAllCategories()).rejects.toThrow(
          new TRPCError({ code: "UNAUTHORIZED" }),
        );
      });
    });

    describe("when a user has categories", () => {
      it("returns categories", async () => {
        const user = await userFactory.create();
        const category = await categoryFactory
          .vars({ user: () => user })
          .create();
        const categoryFolder = await categoryFolderFactory
          .vars({ user: () => user, category: () => category })
          .create();
        const caller = createCaller(
          createInnerContext({ db, currentUserId: user.id }),
        );
        await expect(
          caller.categories.getAllCategories(),
        ).resolves.toStrictEqual([
          {
            id: category.id,
            color: category.color,
            emoji: category.emoji,
            name: category.name,
            createdAt: category.createdAt,
            updatedAt: category.updatedAt,
            userId: user.id,
            categoryFolders: [
              {
                id: categoryFolder.id,
                folderId: categoryFolder.folderId,
                categoryId: categoryFolder.categoryId,
                createdAt: categoryFolder.createdAt,
                updatedAt: categoryFolder.updatedAt,
              },
            ],
          },
        ]);
      });
    });
  });

  describe("#createCategory", () => {
    describe("when a user is not logged in", () => {
      it("throws an error", async () => {
        const folders = await folderFactory.createList(3);
        const caller = createCaller(
          createInnerContext({ db, currentUserId: undefined }),
        );
        await expect(
          caller.categories.createCategory({
            color: "#ffffff",
            name: "name",
            emoji: "😀",
            folderIds: folders.map(({ id }) => id),
          }),
        ).rejects.toThrow(new TRPCError({ code: "UNAUTHORIZED" }));
      });
    });

    describe("when it is called", () => {
      it("creates a folder", async () => {
        const user = await userFactory.create();
        const folders = await folderFactory
          .vars({ user: () => user })
          .createList(3);
        const caller = createCaller(
          createInnerContext({ db, currentUserId: user.id }),
        );
        await expect(
          caller.categories.createCategory({
            color: "#ff0000",
            name: "name",
            emoji: "😀",
            folderIds: folders.map(({ id }) => id),
          }),
        ).resolves.toBeUndefined();
        const createdCategory = await db.category.findFirst({
          select: {
            userId: true,
            name: true,
            emoji: true,
            color: true,
            categoryFolders: {
              select: {
                folderId: true,
              },
            },
          },
          where: {
            userId: user.id,
          },
        });
        expect(createdCategory?.categoryFolders).toHaveLength(3);
        expect(createdCategory).toStrictEqual({
          userId: user.id,
          name: "name",
          emoji: "😀",
          color: "#ff0000",
          categoryFolders: expect.arrayContaining(
            folders.map(({ id }) => ({ folderId: id })),
          ) as unknown,
        });
      });
    });

    describe("when a user does not have a folder", () => {
      it("throws an error", async () => {
        const user = await userFactory.create();
        const folder = await folderFactory.create();
        const caller = createCaller(
          createInnerContext({ db, currentUserId: user.id }),
        );
        await expect(
          caller.categories.createCategory({
            color: "#ffffff",
            name: "name",
            emoji: "😀",
            folderIds: [folder.id],
          }),
        ).rejects.toThrow("The folder does not exist.");
        await expect(
          db.category.findFirst({
            where: {
              userId: user.id,
            },
          }),
        ).resolves.toBeNull();
      });
    });
  });

  describe("#updateCategory", () => {
    describe("when a user is not logged in", () => {
      it("throws an error", async () => {
        const category = await categoryFactory.create();
        const caller = createCaller(
          createInnerContext({ db, currentUserId: undefined }),
        );
        await expect(
          caller.categories.updateCategory({
            id: category.id,
            name: "name",
            emoji: "😀",
            color: "#ff0000",
          }),
        ).rejects.toThrow(new TRPCError({ code: "UNAUTHORIZED" }));
      });
    });

    describe("when a user has a folder", () => {
      it("creates a category", async () => {
        const user = await userFactory.create();
        const category = await categoryFactory
          .vars({ user: () => user })
          .create();
        await categoryFolderFactory
          .vars({ user: () => user, category: () => category })
          .create();
        const folders = await folderFactory
          .vars({ user: () => user })
          .createList(3);
        const caller = createCaller(
          createInnerContext({ db, currentUserId: user.id }),
        );
        await expect(
          caller.categories.updateCategory({
            id: category.id,
            name: "name",
            emoji: "😀",
            color: "#ff0000",
            folderIds: folders.map(({ id }) => id),
          }),
        ).resolves.toBeUndefined();
        const updatedCategory = await db.category.findFirst({
          select: {
            userId: true,
            name: true,
            emoji: true,
            color: true,
            categoryFolders: {
              select: {
                folderId: true,
              },
            },
          },
          where: {
            userId: user.id,
          },
        });
        expect(updatedCategory?.categoryFolders).toHaveLength(3);
        expect(updatedCategory).toStrictEqual({
          userId: user.id,
          name: "name",
          emoji: "😀",
          color: "#ff0000",
          categoryFolders: expect.arrayContaining(
            folders.map(({ id }) => ({ folderId: id })),
          ) as unknown,
        });
      });
    });

    describe("when a user does not have a folder", () => {
      it("throws an error", async () => {
        const user = await userFactory.create();
        const category = await categoryFactory
          .vars({ user: () => user })
          .create();
        await categoryFolderFactory
          .vars({ user: () => user, category: () => category })
          .create();
        const folder = await folderFactory.create();
        const caller = createCaller(
          createInnerContext({ db, currentUserId: user.id }),
        );
        await expect(
          caller.categories.updateCategory({
            id: category.id,
            name: "name",
            folderIds: [folder.id],
          }),
        ).rejects.toThrow("The folder does not exist.");
        await expect(
          db.category.findFirst({
            where: {
              userId: user.id,
            },
          }),
        ).resolves.toStrictEqual(category);
      });
    });

    describe("when a user does not have a category", () => {
      it("throws an error", async () => {
        const user = await userFactory.create();
        const category = await categoryFactory.create();
        const caller = createCaller(
          createInnerContext({ db, currentUserId: user.id }),
        );
        await expect(
          caller.categories.updateCategory({
            id: category.id,
            name: "name",
          }),
        ).rejects.toThrow("The category does not exist.");
        await expect(
          db.category.findFirst({
            where: {
              id: category.id,
            },
          }),
        ).resolves.toStrictEqual(category);
      });
    });
  });

  describe("#deleteCategory", () => {
    describe("when a user is not logged in", () => {
      it("throws an error", async () => {
        const category = await categoryFactory.create();
        const caller = createCaller(
          createInnerContext({ db, currentUserId: undefined }),
        );
        await expect(
          caller.categories.deleteCategory({
            id: category.id,
          }),
        ).rejects.toThrow(new TRPCError({ code: "UNAUTHORIZED" }));
      });
    });

    describe("when a user has the category", () => {
      it("deletes the category", async () => {
        const user = await userFactory.create();
        const category = await categoryFactory
          .vars({ user: () => user })
          .create();
        await categoryFolderFactory
          .vars({ user: () => user, category: () => category })
          .create();
        const caller = createCaller(
          createInnerContext({ db, currentUserId: user.id }),
        );
        await expect(
          caller.categories.deleteCategory({
            id: category.id,
          }),
        ).resolves.toBeUndefined();
        await expect(
          db.category.findFirst({
            where: {
              userId: user.id,
            },
          }),
        ).resolves.toBeNull();
      });
    });

    describe("when a user does not have a category", () => {
      it("throws an error", async () => {
        const user = await userFactory.create();
        const category = await categoryFactory.create();
        await categoryFolderFactory
          .vars({ user: () => user, category: () => category })
          .create();
        const caller = createCaller(
          createInnerContext({ db, currentUserId: user.id }),
        );
        await expect(
          caller.categories.deleteCategory({
            id: category.id,
          }),
        ).rejects.toThrow("The category does not exist.");
        await expect(
          db.category.findFirst({
            where: {
              id: category.id,
            },
          }),
        ).resolves.toStrictEqual(category);
      });
    });
  });
});
