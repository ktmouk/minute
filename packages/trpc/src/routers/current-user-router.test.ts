import { userFactory } from "@minute/prisma/vitest/factories";
import { db } from "@minute/prisma/vitest/helpers";
import { TRPCError } from "@trpc/server";
import { it, describe, vi, expect } from "vitest";
import { createInnerContext } from "../context";
import { createCaller } from ".";

vi.mock("server-only");

describe("currentUserRouter", () => {
  describe("#getCurrentUser", () => {
    describe("when a user is not logged in", () => {
      it("throws an error", async () => {
        const caller = createCaller(
          createInnerContext({ db, currentUserId: undefined }),
        );
        await expect(caller.currentUser.getCurrentUser()).rejects.toThrow(
          new TRPCError({ code: "UNAUTHORIZED" }),
        );
      });
    });

    describe("when a user is logged in", () => {
      it("returns the current user", async () => {
        const user = await userFactory.create();
        await userFactory.create();
        await userFactory.create();
        const caller = createCaller(
          createInnerContext({ db, currentUserId: user.id }),
        );
        await expect(
          caller.currentUser.getCurrentUser(),
        ).resolves.toStrictEqual({
          id: user.id,
          image: user.image,
          name: user.name,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        });
      });
    });
  });
});
