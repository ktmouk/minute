import {
  categoryFactory,
  folderFactory,
  userFactory,
} from "@minute/prisma/vitest/factories";
import { db } from "@minute/prisma/vitest/helpers";
import { it, describe, vi, expect } from "vitest";
import { createChart } from "./create-chart";

vi.mock("server-only");

describe("createChart", () => {
  describe("when a user has all folders and categories", () => {
    it("creates the chart and its items", async () => {
      const user = await userFactory.create();
      const folders = await folderFactory
        .vars({ user: () => user })
        .createList(3);
      const categories = await categoryFactory
        .vars({ user: () => user })
        .createList(2);
      await expect(
        createChart(db)({
          userId: user.id,
          name: "name",
          folderIds: folders.map(({ id }) => id),
          categoryIds: categories.map(({ id }) => id),
        }),
      ).resolves.toBeUndefined();
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
      expect(chart?.chartFolders).toHaveLength(3);
      expect(chart?.chartCategories).toHaveLength(2);
      expect(chart).toStrictEqual({
        userId: user.id,
        name: "name",
        chartFolders: expect.arrayContaining(
          folders.map(({ id }) => ({ folderId: id })),
        ) as unknown,
        chartCategories: expect.arrayContaining(
          categories.map(({ id }) => ({ categoryId: id })),
        ) as unknown,
      });
    });
  });

  describe("when a user does not have a folder", () => {
    it("throws an error", async () => {
      const user = await userFactory.create();
      const categories = await categoryFactory
        .vars({ user: () => user })
        .createList(2);
      const folder1 = await folderFactory.vars({ user: () => user }).create();
      const folder2 = await folderFactory.create();
      await expect(
        createChart(db)({
          userId: user.id,
          name: "name",
          folderIds: [folder1.id, folder2.id],
          categoryIds: categories.map(({ id }) => id),
        }),
      ).rejects.toThrow("The folder does not exist.");
      await expect(
        db.chart.findFirst({
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
      const folders = await folderFactory
        .vars({ user: () => user })
        .createList(2);
      const category1 = await categoryFactory
        .vars({ user: () => user })
        .create();
      const category2 = await categoryFactory.create();
      await expect(
        createChart(db)({
          userId: user.id,
          name: "name",
          categoryIds: [category1.id, category2.id],
          folderIds: folders.map(({ id }) => id),
        }),
      ).rejects.toThrow("The category does not exist.");
      await expect(
        db.chart.findFirst({
          where: {
            userId: user.id,
          },
        }),
      ).resolves.toBeNull();
    });
  });

  describe("when categoryIds and folderIds are empty", () => {
    it("creates the chart", async () => {
      const user = await userFactory.create();
      await expect(
        createChart(db)({
          userId: user.id,
          name: "name",
          categoryIds: [],
          folderIds: [],
        }),
      ).resolves.toBeUndefined();
      await expect(
        db.chart.findFirst({
          select: {
            userId: true,
            name: true,
            chartCategories: true,
            chartFolders: true,
          },
          where: {
            userId: user.id,
          },
        }),
      ).resolves.toStrictEqual({
        userId: user.id,
        name: "name",
        chartFolders: [],
        chartCategories: [],
      });
    });
  });

  describe("when categoryIds is empty", () => {
    it("creates the chart and its items", async () => {
      const user = await userFactory.create();
      const folders = await folderFactory
        .vars({ user: () => user })
        .createList(3);
      await expect(
        createChart(db)({
          userId: user.id,
          name: "name",
          folderIds: folders.map(({ id }) => id),
          categoryIds: [],
        }),
      ).resolves.toBeUndefined();
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
      expect(chart?.chartFolders).toHaveLength(3);
      expect(chart?.chartCategories).toHaveLength(0);
      expect(chart).toStrictEqual({
        userId: user.id,
        name: "name",
        chartFolders: expect.arrayContaining(
          folders.map(({ id }) => ({ folderId: id })),
        ) as unknown,
        chartCategories: [],
      });
    });
  });

  describe("when folderIds is empty", () => {
    it("creates the chart and its items", async () => {
      const user = await userFactory.create();
      const categories = await categoryFactory
        .vars({ user: () => user })
        .createList(2);
      await expect(
        createChart(db)({
          userId: user.id,
          name: "name",
          folderIds: [],
          categoryIds: categories.map(({ id }) => id),
        }),
      ).resolves.toBeUndefined();
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
        name: "name",
        chartFolders: [],
        chartCategories: expect.arrayContaining(
          categories.map(({ id }) => ({ categoryId: id })),
        ) as unknown,
      });
    });
  });
});
