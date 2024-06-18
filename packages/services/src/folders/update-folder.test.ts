import { folderFactory, userFactory } from "@minute/prisma/vitest/factories";
import { db } from "@minute/prisma/vitest/helpers";
import { it, describe, vi, expect } from "vitest";
import { updateFolder } from "./update-folder";

vi.mock("server-only");

describe("updateFolder", () => {
  describe("when a user has the folder", () => {
    it("updates the folder", async () => {
      const user = await userFactory.create();
      const folder = await folderFactory.vars({ user: () => user }).create();
      await expect(
        updateFolder(db)({
          id: folder.id,
          userId: user.id,
          name: "name",
          emoji: "😀",
          color: "#ffffff",
        }),
      ).resolves.toBeUndefined();
      await expect(
        db.folder.findUnique({
          select: {
            id: true,
            userId: true,
            name: true,
            emoji: true,
            color: true,
          },
          where: {
            id: folder.id,
          },
        }),
      ).resolves.toStrictEqual({
        color: "#ffffff",
        emoji: "😀",
        id: folder.id,
        name: "name",
        userId: user.id,
      });
    });
  });

  describe("when another user has the folder", () => {
    it("does not update the folder", async () => {
      const user = await userFactory.create();
      const folder = await folderFactory.create();
      await expect(
        updateFolder(db)({
          id: folder.id,
          userId: user.id,
          name: "name",
          emoji: "😀",
          color: "#ffffff",
        }),
      ).rejects.toThrow("The folder does not exist.");
      await expect(
        db.folder.findUnique({
          where: {
            id: folder.id,
          },
        }),
      ).resolves.toStrictEqual(folder);
    });
  });
});
