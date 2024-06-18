import { db } from "@minute/prisma/vitest/helpers";
import { TRPCError } from "@trpc/server";
import { it, describe, vi, expect } from "vitest";
import { createInnerContext } from "./context";
import { protectedProcedure } from "./procedures";
import { router, createCallerFactory } from "./trpc";

vi.mock("server-only");

describe("protectedProcedure", () => {
  describe("when the currentUserId is undefined", () => {
    it("throws an error", async () => {
      const appRouter = router({
        test: protectedProcedure.query(({ ctx }) => ctx),
      });
      const createCaller = createCallerFactory(appRouter);
      const caller = createCaller(
        createInnerContext({ db, currentUserId: undefined }),
      );
      await expect(caller.test()).rejects.toThrow(
        new TRPCError({ code: "UNAUTHORIZED" }),
      );
    });
  });

  describe("when the currentUserId is an empty", () => {
    it("throws an error", async () => {
      const appRouter = router({
        test: protectedProcedure.query(({ ctx }) => ctx),
      });
      const createCaller = createCallerFactory(appRouter);
      const caller = createCaller(
        createInnerContext({ db, currentUserId: "" }),
      );
      await expect(caller.test()).rejects.toThrow(
        new TRPCError({ code: "UNAUTHORIZED" }),
      );
    });
  });

  describe("when the currentUserId is not uuid", () => {
    it("throws an error", async () => {
      const appRouter = router({
        test: protectedProcedure.query(({ ctx }) => ctx),
      });
      const createCaller = createCallerFactory(appRouter);
      const caller = createCaller(
        createInnerContext({ db, currentUserId: "invalid" }),
      );
      await expect(caller.test()).rejects.toThrow(
        new TRPCError({ code: "UNAUTHORIZED" }),
      );
    });
  });

  describe("when the currentUserId is uuid", () => {
    it("invokes the query", async () => {
      const appRouter = router({
        test: protectedProcedure.query(({ ctx }) => {
          return ctx.currentUserId;
        }),
      });
      const currentUserId = "b3f77330-81f4-433b-b974-278e579b9f21";
      const createCaller = createCallerFactory(appRouter);
      const caller = createCaller(createInnerContext({ db, currentUserId }));
      await expect(caller.test()).resolves.toBe(currentUserId);
    });
  });
});
