import { folderFactory, userFactory } from "@minute/prisma/vitest/factories";
import { db } from "@minute/prisma/vitest/helpers";
import { TRPCError } from "@trpc/server";
import { it, describe, vi, expect } from "vitest";
import { createInnerContext } from "../context";
import { createCaller } from ".";

vi.mock("server-only");

describe("folderRouter", () => {
  describe("#createFolder", () => {
    describe("when a user is not logged in", () => {
      it("throws an error", async () => {
        const caller = createCaller(
          createInnerContext({ db, currentUserId: undefined }),
        );
        await expect(
          caller.folders.createFolder({
            color: "#ffffff",
            name: "name",
            emoji: "😀",
          }),
        ).rejects.toThrow(new TRPCError({ code: "UNAUTHORIZED" }));
      });
    });

    describe("when it is called", () => {
      it("creates a folder", async () => {
        const user = await userFactory.create();
        const caller = createCaller(
          createInnerContext({ db, currentUserId: user.id }),
        );
        await expect(
          caller.folders.createFolder({
            color: "#ffffff",
            name: "name",
            emoji: "😀",
          }),
        ).resolves.toBeUndefined();
        await expect(
          db.folder.findFirst({
            select: {
              id: true,
              userId: true,
              color: true,
              name: true,
              emoji: true,
            },
            where: {
              userId: user.id,
            },
          }),
        ).resolves.toStrictEqual({
          id: expect.any(String) as unknown,
          color: "#ffffff",
          userId: user.id,
          name: "name",
          emoji: "😀",
        });
      });
    });
  });

  describe("#moveFolder", () => {
    describe("when a user is not logged in", () => {
      it("throws an error", async () => {
        const caller = createCaller(
          createInnerContext({ db, currentUserId: undefined }),
        );
        const ancestorFolder = await folderFactory.create();
        const folder = await folderFactory.create();
        await expect(
          caller.folders.moveFolder({
            ancestorId: ancestorFolder.id,
            afterFolderId: null,
            folderId: folder.id,
          }),
        ).rejects.toThrow(new TRPCError({ code: "UNAUTHORIZED" }));
      });
    });

    describe("when it is called", () => {
      it("moves a folder", async () => {
        const user = await userFactory.create();
        const ancestorFolder = await folderFactory
          .use((t) => t.root)
          .vars({ user: () => user })
          .create();
        const folder = await folderFactory
          .use((t) => t.root)
          .vars({ user: () => user })
          .create();
        const caller = createCaller(
          createInnerContext({ db, currentUserId: user.id }),
        );
        await expect(
          caller.folders.moveFolder({
            ancestorId: ancestorFolder.id,
            afterFolderId: null,
            folderId: folder.id,
          }),
        ).resolves.toBeUndefined();
        const expected = [
          {
            depth: 1,
            ancestorId: null,
            descendantId: ancestorFolder.id,
            userId: user.id,
          },
          {
            depth: 2,
            ancestorId: null,
            descendantId: folder.id,
            userId: user.id,
          },
          {
            depth: 0,
            ancestorId: ancestorFolder.id,
            descendantId: ancestorFolder.id,
            userId: user.id,
          },
          {
            depth: 1,
            ancestorId: ancestorFolder.id,
            descendantId: folder.id,
            userId: user.id,
          },
          {
            depth: 0,
            ancestorId: folder.id,
            descendantId: folder.id,
            userId: user.id,
          },
        ];
        const folderHierarchies = await db.folderHierarchy.findMany({
          select: {
            userId: true,
            ancestorId: true,
            descendantId: true,
            depth: true,
          },
          where: {
            userId: user.id,
          },
        });
        expect(folderHierarchies).toHaveLength(expected.length);
        expect(folderHierarchies).toStrictEqual(
          expect.arrayContaining(expected),
        );
      });
    });

    describe("when another user has an ancestor folder", () => {
      it("throws an error", async () => {
        const user = await userFactory.create();
        const ancestorFolder = await folderFactory.use((t) => t.root).create();
        const folder = await folderFactory
          .use((t) => t.root)
          .vars({ user: () => user })
          .create();
        const caller = createCaller(
          createInnerContext({ db, currentUserId: user.id }),
        );
        await expect(
          caller.folders.moveFolder({
            ancestorId: ancestorFolder.id,
            afterFolderId: null,
            folderId: folder.id,
          }),
        ).rejects.toThrow("The ancestor folder does not exist.");
      });
    });

    describe("when another user has a folder", () => {
      it("throws an error", async () => {
        const user = await userFactory.create();
        const ancestorFolder = await folderFactory
          .use((t) => t.root)
          .vars({ user: () => user })
          .create();
        const folder = await folderFactory.use((t) => t.root).create();
        const caller = createCaller(
          createInnerContext({ db, currentUserId: user.id }),
        );
        await expect(
          caller.folders.moveFolder({
            ancestorId: ancestorFolder.id,
            afterFolderId: null,
            folderId: folder.id,
          }),
        ).rejects.toThrow("The folder does not exist.");
      });
    });
  });

  describe("#updateFolder", () => {
    describe("when a user is not logged in", () => {
      it("throws an error", async () => {
        const folder = await folderFactory.create();
        const caller = createCaller(
          createInnerContext({ db, currentUserId: undefined }),
        );
        await expect(
          caller.folders.updateFolder({
            id: folder.id,
            color: "#ffffff",
            name: "name",
            emoji: "😀",
          }),
        ).rejects.toThrow(new TRPCError({ code: "UNAUTHORIZED" }));
      });
    });

    describe("when it is called", () => {
      it("updates a folder", async () => {
        const user = await userFactory.create();
        const folder = await folderFactory.vars({ user: () => user }).create();
        const caller = createCaller(
          createInnerContext({ db, currentUserId: user.id }),
        );
        await expect(
          caller.folders.updateFolder({
            id: folder.id,
            color: "#ffffff",
            name: "name",
            emoji: "😀",
          }),
        ).resolves.toBeUndefined();
        await expect(
          db.folder.findFirst({
            select: {
              id: true,
              userId: true,
              color: true,
              name: true,
              emoji: true,
            },
            where: {
              userId: user.id,
            },
          }),
        ).resolves.toStrictEqual({
          id: folder.id,
          color: "#ffffff",
          userId: user.id,
          name: "name",
          emoji: "😀",
        });
      });
    });

    describe("when another user has a folder", () => {
      it("throws an error", async () => {
        const user = await userFactory.create();
        const folder = await folderFactory.create();
        const caller = createCaller(
          createInnerContext({ db, currentUserId: user.id }),
        );
        await expect(
          caller.folders.updateFolder({
            id: folder.id,
            color: "#ffffff",
            name: "name",
            emoji: "😀",
          }),
        ).rejects.toThrow("The folder does not exist.");
      });
    });
  });

  describe("#getAllFolders", () => {
    describe("when a user is not logged in", () => {
      it("throws an error", async () => {
        const caller = createCaller(
          createInnerContext({ db, currentUserId: undefined }),
        );
        await expect(caller.folders.getAllFolders()).rejects.toThrow(
          new TRPCError({ code: "UNAUTHORIZED" }),
        );
      });
    });

    describe("when a user has folders", () => {
      it("returns folders", async () => {
        const user = await userFactory.create();
        const folder = await folderFactory
          .vars({ user: () => user })
          .use((t) => t.root)
          .create();
        const caller = createCaller(
          createInnerContext({ db, currentUserId: user.id }),
        );
        await expect(caller.folders.getAllFolders()).resolves.toStrictEqual([
          {
            id: folder.id,
            color: folder.color,
            emoji: folder.emoji,
            name: folder.name,
            parentId: null,
            order: folder.order,
            createdAt: folder.createdAt,
            updatedAt: folder.updatedAt,
            userId: user.id,
          },
        ]);
      });
    });

    describe("when another user has folders", () => {
      it("returns an empty array", async () => {
        const user = await userFactory.create();
        await folderFactory.create();
        const caller = createCaller(
          createInnerContext({ db, currentUserId: user.id }),
        );
        await expect(caller.folders.getAllFolders()).resolves.toStrictEqual([]);
      });
    });
  });

  describe("#deleteFolder", () => {
    describe("when a user is not logged in", () => {
      it("throws an error", async () => {
        const folder = await folderFactory.create();
        const caller = createCaller(
          createInnerContext({ db, currentUserId: undefined }),
        );
        await expect(
          caller.folders.deleteFolder({
            id: folder.id,
          }),
        ).rejects.toThrow(new TRPCError({ code: "UNAUTHORIZED" }));
      });
    });

    describe("when a user has the folder", () => {
      it("deletes the folder", async () => {
        const user = await userFactory.create();
        const folder = await folderFactory.vars({ user: () => user }).create();
        const caller = createCaller(
          createInnerContext({ db, currentUserId: user.id }),
        );
        await expect(
          caller.folders.deleteFolder({
            id: folder.id,
          }),
        ).resolves.toBeUndefined();
        await expect(
          db.folder.findFirst({
            where: {
              userId: user.id,
            },
          }),
        ).resolves.toBeNull();
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
          caller.folders.deleteFolder({
            id: folder.id,
          }),
        ).rejects.toThrow("The folder does not exist.");
        await expect(
          db.folder.findFirst({
            where: {
              id: folder.id,
            },
          }),
        ).resolves.toStrictEqual(folder);
      });
    });
  });
});
