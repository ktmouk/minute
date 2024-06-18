import {
  folderFactory,
  runningTimeEntryFactory,
  userFactory,
} from "@minute/prisma/vitest/factories";
import { db } from "@minute/prisma/vitest/helpers";
import { TRPCError } from "@trpc/server";
import { parseISO } from "date-fns";
import { it, describe, vi, expect } from "vitest";
import { createInnerContext } from "../context";
import { createCaller } from ".";

vi.mock("server-only");

describe("runningTimeEntryRouter", () => {
  describe("#startRunningTimeEntry", () => {
    describe("when a user is not logged in", () => {
      it("throws an error", async () => {
        const caller = createCaller(
          createInnerContext({ db, currentUserId: undefined }),
        );
        await expect(
          caller.runningTimeEntry.startRunningTimeEntry({
            description: "description",
            folderId: (await folderFactory.create()).id,
            startedAt: parseISO("2024-01-01T01:23:45"),
          }),
        ).rejects.toThrow(new TRPCError({ code: "UNAUTHORIZED" }));
      });
    });

    describe("when a user does not have a runningTimeEntry", () => {
      it("creates a runningTimeEntry", async () => {
        const user = await userFactory.create();
        const folder = await folderFactory.vars({ user: () => user }).create();
        const caller = createCaller(
          createInnerContext({ db, currentUserId: user.id }),
        );
        await expect(
          caller.runningTimeEntry.startRunningTimeEntry({
            description: "description",
            folderId: folder.id,
            startedAt: parseISO("2024-01-01T01:23:45"),
          }),
        ).resolves.toBeUndefined();
        await expect(
          db.runningTimeEntry.findUnique({
            select: {
              description: true,
              startedAt: true,
              folderId: true,
              userId: true,
            },
            where: {
              userId: user.id,
            },
          }),
        ).resolves.toStrictEqual({
          description: "description",
          folderId: folder.id,
          startedAt: parseISO("2024-01-01T01:23:45"),
          userId: user.id,
        });
      });
    });

    describe("when a user has a runningTimeEntry", () => {
      it("throws an error", async () => {
        const user = await userFactory.create();
        const folder = await folderFactory.vars({ user: () => user }).create();
        await runningTimeEntryFactory.vars({ user: () => user }).create();
        const caller = createCaller(
          createInnerContext({ db, currentUserId: user.id }),
        );
        await expect(
          caller.runningTimeEntry.startRunningTimeEntry({
            description: "description",
            folderId: folder.id,
            startedAt: parseISO("2024-01-01T01:23:45"),
          }),
        ).rejects.toThrow(TRPCError);
      });
    });
  });

  describe("#stopRunningTimeEntry", () => {
    describe("when a user is not logged in", () => {
      it("throws an error", async () => {
        const caller = createCaller(
          createInnerContext({ db, currentUserId: undefined }),
        );
        await expect(
          caller.runningTimeEntry.stopRunningTimeEntry({
            stoppedAt: parseISO("2024-01-01T01:23:45"),
          }),
        ).rejects.toThrow(new TRPCError({ code: "UNAUTHORIZED" }));
      });
    });

    describe("when a user has a runningTimeEntry", () => {
      it("creates a timeEntry", async () => {
        const user = await userFactory.create();
        await runningTimeEntryFactory
          .props({ startedAt: () => parseISO("2024-01-01T01:23:45") })
          .vars({ user: () => user })
          .create();
        const caller = createCaller(
          createInnerContext({ db, currentUserId: user.id }),
        );
        await expect(
          caller.runningTimeEntry.stopRunningTimeEntry({
            stoppedAt: parseISO("2024-01-01T02:23:45"),
          }),
        ).resolves.toBeUndefined();
        await expect(
          db.timeEntry.findFirst({
            select: {
              startedAt: true,
              stoppedAt: true,
              duration: true,
            },
            where: {
              task: {
                userId: user.id,
              },
            },
          }),
        ).resolves.toStrictEqual({
          startedAt: parseISO("2024-01-01T01:23:45"),
          stoppedAt: parseISO("2024-01-01T02:23:45"),
          duration: 3600,
        });
      });
    });

    describe("when another user has a runningTimeEntry", () => {
      it("throws an error", async () => {
        const user = await userFactory.create();
        const runningTimeEntry = await runningTimeEntryFactory.create();
        const caller = createCaller(
          createInnerContext({ db, currentUserId: user.id }),
        );
        await expect(
          caller.runningTimeEntry.stopRunningTimeEntry({
            stoppedAt: parseISO("2024-01-01T01:23:45"),
          }),
        ).rejects.toThrow();
        await expect(
          db.runningTimeEntry.findUnique({
            where: {
              id: runningTimeEntry.id,
            },
          }),
        ).resolves.toStrictEqual(runningTimeEntry);
      });
    });
  });

  describe("#updateRunningTimeEntry", () => {
    describe("when a user is not logged in", () => {
      it("throws an error", async () => {
        const caller = createCaller(
          createInnerContext({ db, currentUserId: undefined }),
        );
        await expect(
          caller.runningTimeEntry.updateRunningTimeEntry({
            description: "description",
            startedAt: parseISO("2024-01-01T01:23:45"),
          }),
        ).rejects.toThrow(new TRPCError({ code: "UNAUTHORIZED" }));
      });
    });

    describe("when a user has a runningTimeEntry", () => {
      it("updates the runningTimeEntry", async () => {
        const user = await userFactory.create();
        const runningTimeEntry = await runningTimeEntryFactory
          .vars({ user: () => user })
          .create();
        const caller = createCaller(
          createInnerContext({ db, currentUserId: user.id }),
        );
        await expect(
          caller.runningTimeEntry.updateRunningTimeEntry({
            description: "description",
            startedAt: parseISO("2024-01-01T01:23:45"),
          }),
        ).resolves.toBeUndefined();
        await expect(
          db.runningTimeEntry.findUnique({
            select: {
              description: true,
              startedAt: true,
              folderId: true,
              userId: true,
            },
            where: {
              id: runningTimeEntry.id,
            },
          }),
        ).resolves.toStrictEqual({
          description: "description",
          folderId: runningTimeEntry.folderId,
          startedAt: parseISO("2024-01-01T01:23:45"),
          userId: user.id,
        });
      });
    });

    describe("when another user has a runningTimeEntry", () => {
      it("does not update another user's runningTimeEntry", async () => {
        const user = await userFactory.create();
        const runningTimeEntry = await runningTimeEntryFactory.create();
        const caller = createCaller(
          createInnerContext({ db, currentUserId: user.id }),
        );
        await expect(
          caller.runningTimeEntry.updateRunningTimeEntry({
            description: "description",
            startedAt: parseISO("2024-01-01T01:23:45"),
          }),
        ).rejects.toThrow();
        await expect(
          db.runningTimeEntry.findUnique({
            where: {
              id: runningTimeEntry.id,
            },
          }),
        ).resolves.toStrictEqual(runningTimeEntry);
      });
    });
  });

  describe("#getRunningTimeEntry", () => {
    describe("when a user is not logged in", () => {
      it("throws an error", async () => {
        const caller = createCaller(
          createInnerContext({ db, currentUserId: undefined }),
        );
        await expect(
          caller.runningTimeEntry.getRunningTimeEntry(),
        ).rejects.toThrow(new TRPCError({ code: "UNAUTHORIZED" }));
      });
    });

    describe("when a user does not have a runningTimeEntry", () => {
      it("returns null", async () => {
        const user = await userFactory.create();
        const caller = createCaller(
          createInnerContext({ db, currentUserId: user.id }),
        );
        await expect(
          caller.runningTimeEntry.getRunningTimeEntry(),
        ).resolves.toBeNull();
      });
    });

    describe("when a user has a runningTimeEntry", () => {
      it("returns the runningTimeEntry", async () => {
        const user = await userFactory.create();
        const runningTimeEntry = await runningTimeEntryFactory
          .vars({ user: () => user })
          .create();
        const caller = createCaller(
          createInnerContext({ db, currentUserId: user.id }),
        );
        await expect(
          caller.runningTimeEntry.getRunningTimeEntry(),
        ).resolves.toStrictEqual(runningTimeEntry);
      });
    });

    describe("when another user has a runningTimeEntry", () => {
      it("returns null", async () => {
        const user = await userFactory.create();
        await runningTimeEntryFactory.create();
        const caller = createCaller(
          createInnerContext({ db, currentUserId: user.id }),
        );
        await expect(
          caller.runningTimeEntry.getRunningTimeEntry(),
        ).resolves.toBeNull();
      });
    });
  });
});
