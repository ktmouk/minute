import {
  folderHierarchyFactory,
  userFactory,
} from "@minute/prisma/vitest/factories";
import { db } from "@minute/prisma/vitest/helpers";
import { TRPCError } from "@trpc/server";
import { it, describe, vi, expect } from "vitest";
import { createInnerContext } from "../context";
import { createCaller } from ".";

vi.mock("server-only");

describe("folderHierarchiesRouter", () => {
  describe("#getFolderHierarchies", () => {
    describe("when a user is not logged in", () => {
      it("throws an error", async () => {
        const caller = createCaller(
          createInnerContext({ db, currentUserId: undefined }),
        );
        await expect(
          caller.folderHierarchies.getFolderHierarchies(),
        ).rejects.toThrow(new TRPCError({ code: "UNAUTHORIZED" }));
      });
    });

    describe("when a user has folderHierarchies", () => {
      it("returns folderHierarchies", async () => {
        const user = await userFactory.create();
        const folderHierarchy = await folderHierarchyFactory
          .props({ depth: () => 1 })
          .vars({ user: () => user })
          .create();
        const caller = createCaller(
          createInnerContext({ db, currentUserId: user.id }),
        );
        await expect(
          caller.folderHierarchies.getFolderHierarchies(),
        ).resolves.toStrictEqual([
          {
            ancestorId: folderHierarchy.ancestorId,
            depth: 1,
            descendantId: folderHierarchy.descendantId,
            id: folderHierarchy.id,
            createdAt: folderHierarchy.createdAt,
            updatedAt: folderHierarchy.updatedAt,
            userId: user.id,
          },
        ]);
      });
    });

    describe("when another user has folderHierarchies", () => {
      it("returns an empty array", async () => {
        const user = await userFactory.create();
        await folderHierarchyFactory.props({ depth: () => 1 }).create();
        const caller = createCaller(
          createInnerContext({ db, currentUserId: user.id }),
        );
        await expect(
          caller.folderHierarchies.getFolderHierarchies(),
        ).resolves.toStrictEqual([]);
      });
    });
  });
});
