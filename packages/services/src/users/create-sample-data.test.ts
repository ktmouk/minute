import { userFactory } from "@minute/prisma/vitest/factories";
import { db } from "@minute/prisma/vitest/helpers";
import { it, describe, vi, expect } from "vitest";
import { createSampleData } from "./create-sample-data";

vi.mock("server-only");

describe("createSampleData", () => {
  describe("when a user exists", () => {
    it("creates sample data", async () => {
      const user = await userFactory.create();
      await expect(
        createSampleData(db)({
          userId: user.id,
        }),
      ).resolves.toBeUndefined();
      const folders = await db.folder.findMany({
        select: {
          id: true,
          userId: true,
          color: true,
          name: true,
          emoji: true,
          parentId: true,
          order: true,
        },
        where: {
          userId: user.id,
        },
      });
      expect(folders).toHaveLength(4);
      expect(folders).toStrictEqual(
        expect.arrayContaining([
          {
            id: expect.any(String) as unknown,
            color: "#9c3e00",
            emoji: "💼",
            name: "Work",
            order: 0,
            parentId: null,
            userId: user.id,
          },
          {
            id: expect.any(String) as unknown,
            color: "#3b3936",
            emoji: "🎮",
            name: "Game",
            order: 1,
            parentId: null,
            userId: user.id,
          },
          {
            id: expect.any(String) as unknown,
            color: "#f24405",
            emoji: "📖",
            name: "Study",
            order: 2,
            parentId: null,
            userId: user.id,
          },
          {
            id: expect.any(String) as unknown,
            color: "#348888",
            emoji: "🎣",
            name: "Hobby",
            order: 3,
            parentId: null,
            userId: user.id,
          },
        ]),
      );
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
      expect(folderHierarchies).toHaveLength(8);
      expect(folderHierarchies).toStrictEqual(
        expect.arrayContaining([
          {
            userId: user.id,
            ancestorId: folders[0]?.id,
            descendantId: folders[0]?.id,
            depth: 0,
          },
          {
            userId: user.id,
            ancestorId: folders[1]?.id,
            descendantId: folders[1]?.id,
            depth: 0,
          },
          {
            userId: user.id,
            ancestorId: folders[2]?.id,
            descendantId: folders[2]?.id,
            depth: 0,
          },
          {
            userId: user.id,
            ancestorId: folders[3]?.id,
            descendantId: folders[3]?.id,
            depth: 0,
          },
          {
            userId: user.id,
            ancestorId: null,
            descendantId: folders[0]?.id,
            depth: 1,
          },
          {
            userId: user.id,
            ancestorId: null,
            descendantId: folders[1]?.id,
            depth: 1,
          },
          {
            userId: user.id,
            ancestorId: null,
            descendantId: folders[2]?.id,
            depth: 1,
          },
          {
            userId: user.id,
            ancestorId: null,
            descendantId: folders[3]?.id,
            depth: 1,
          },
        ]),
      );
      const categories = await db.category.findMany({
        select: {
          id: true,
          userId: true,
          name: true,
          categoryFolders: {
            select: {
              folder: {
                select: {
                  name: true,
                  userId: true,
                },
              },
            },
          },
        },
        where: {
          userId: user.id,
        },
      });
      expect(categories).toHaveLength(2);
      expect(categories[0]?.categoryFolders).toHaveLength(2);
      expect(categories[1]?.categoryFolders).toHaveLength(2);
      expect(categories).toStrictEqual(
        expect.arrayContaining([
          {
            name: "LessMeaningful",
            userId: user.id,
            id: expect.any(String) as unknown,
            categoryFolders: expect.arrayContaining([
              {
                folder: {
                  name: "Work",
                  userId: user.id,
                },
              },
              {
                folder: {
                  name: "Game",
                  userId: user.id,
                },
              },
            ]) as unknown,
          },
          {
            name: "Meaningful",
            userId: user.id,
            id: expect.any(String) as unknown,
            categoryFolders: expect.arrayContaining([
              {
                folder: {
                  name: "Study",
                  userId: user.id,
                },
              },
              {
                folder: {
                  name: "Hobby",
                  userId: user.id,
                },
              },
            ]) as unknown,
          },
        ]),
      );
      const chart = await db.chart.findFirst({
        select: {
          userId: true,
          name: true,
          chartCategories: {
            select: {
              categoryId: true,
            },
          },
          chartFolders: {
            select: {
              folderId: true,
            },
          },
        },
        where: {
          userId: user.id,
        },
      });
      expect(chart?.chartFolders).toHaveLength(0);
      expect(chart?.chartCategories).toHaveLength(2);
      expect(chart).toStrictEqual({
        userId: user.id,
        name: "Meaningful vs LessMeaningful",
        chartFolders: [],
        chartCategories: expect.arrayContaining(
          categories.map(({ id }) => ({ categoryId: id })),
        ) as unknown,
      });
    });
  });

  describe("when a user does not exist", () => {
    it("throws an error", async () => {
      await expect(
        createSampleData(db)({
          userId: "948346d6-9f56-47d5-a6bc-0ecdf9398b52",
        }),
      ).rejects.toThrow("The user does not exist.");
    });
  });
});
