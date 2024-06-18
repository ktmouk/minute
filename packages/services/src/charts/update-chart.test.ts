import {
  categoryFactory,
  chartCategoryFactory,
  chartFactory,
  chartFolderFactory,
  folderFactory,
  userFactory,
} from "@minute/prisma/vitest/factories";
import { db } from "@minute/prisma/vitest/helpers";
import { it, describe, vi, expect } from "vitest";
import { updateChart } from "./update-chart";

vi.mock("server-only");

describe("updateChart", () => {
  describe("when a folderIds is changed", () => {
    it("updates the chart and its items", async () => {
      const user = await userFactory.create();
      const chart = await chartFactory.vars({ user: () => user }).create();
      const chartCategory = await chartCategoryFactory
        .vars({ user: () => user, chart: () => chart })
        .create();
      await chartFolderFactory
        .vars({ user: () => user, chart: () => chart })
        .create();
      const folders = await folderFactory
        .vars({ user: () => user })
        .createList(3);
      await expect(
        updateChart(db)({
          id: chart.id,
          userId: user.id,
          name: "name",
          folderIds: folders.map(({ id }) => id),
        }),
      ).resolves.toBeUndefined();
      const updatedChart = await db.chart.findFirst({
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
      expect(updatedChart?.chartFolders).toHaveLength(3);
      expect(updatedChart).toStrictEqual({
        userId: user.id,
        name: "name",
        chartCategories: [{ categoryId: chartCategory.categoryId }],
        chartFolders: expect.arrayContaining(
          folders.map(({ id }) => ({ folderId: id })),
        ) as unknown,
      });
    });
  });

  describe("when a folderIds is empty", () => {
    it("updates the chart and its items", async () => {
      const user = await userFactory.create();
      const chart = await chartFactory.vars({ user: () => user }).create();
      const chartCategory = await chartCategoryFactory
        .vars({ user: () => user, chart: () => chart })
        .create();
      await chartFolderFactory
        .vars({ user: () => user, chart: () => chart })
        .create();
      await expect(
        updateChart(db)({
          id: chart.id,
          userId: user.id,
          name: "name",
          folderIds: [],
        }),
      ).resolves.toBeUndefined();
      const updatedChart = await db.chart.findFirst({
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
      expect(updatedChart).toStrictEqual({
        userId: user.id,
        name: "name",
        chartFolders: [],
        chartCategories: [{ categoryId: chartCategory.categoryId }],
      });
    });
  });

  describe("when a categoryIds is changed", () => {
    it("updates the chart and its items", async () => {
      const user = await userFactory.create();
      const chart = await chartFactory.vars({ user: () => user }).create();
      const chartFolder = await chartFolderFactory
        .vars({ user: () => user, chart: () => chart })
        .create();
      await chartCategoryFactory
        .vars({ user: () => user, chart: () => chart })
        .create();
      const categories = await categoryFactory
        .vars({ user: () => user })
        .createList(3);
      await expect(
        updateChart(db)({
          id: chart.id,
          userId: user.id,
          name: "name",
          categoryIds: categories.map(({ id }) => id),
        }),
      ).resolves.toBeUndefined();
      const updatedChart = await db.chart.findFirst({
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
      expect(updatedChart?.chartCategories).toHaveLength(3);
      expect(updatedChart).toStrictEqual({
        userId: user.id,
        name: "name",
        chartFolders: [{ folderId: chartFolder.folderId }],
        chartCategories: expect.arrayContaining(
          categories.map(({ id }) => ({ categoryId: id })),
        ) as unknown,
      });
    });
  });

  describe("when a categoryIds is empty", () => {
    it("updates the chart and its items", async () => {
      const user = await userFactory.create();
      const chart = await chartFactory.vars({ user: () => user }).create();
      await chartCategoryFactory
        .vars({ user: () => user, chart: () => chart })
        .create();
      const chartFolder = await chartFolderFactory
        .vars({ user: () => user, chart: () => chart })
        .create();
      await expect(
        updateChart(db)({
          id: chart.id,
          userId: user.id,
          name: "name",
          categoryIds: [],
        }),
      ).resolves.toBeUndefined();
      const updatedChart = await db.chart.findFirst({
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
      expect(updatedChart).toStrictEqual({
        userId: user.id,
        name: "name",
        chartFolders: [{ folderId: chartFolder.folderId }],
        chartCategories: [],
      });
    });
  });

  describe("when folderIds and categoryIds are empty", () => {
    it("updates the chart and its items", async () => {
      const user = await userFactory.create();
      const chart = await chartFactory.vars({ user: () => user }).create();
      await chartFolderFactory
        .vars({ user: () => user, chart: () => chart })
        .create();
      await chartCategoryFactory
        .vars({ user: () => user, chart: () => chart })
        .create();
      await expect(
        updateChart(db)({
          id: chart.id,
          userId: user.id,
          name: "name",
          categoryIds: [],
          folderIds: [],
        }),
      ).resolves.toBeUndefined();
      const updatedChart = await db.chart.findFirst({
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
      expect(updatedChart).toStrictEqual({
        userId: user.id,
        name: "name",
        chartCategories: [],
        chartFolders: [],
      });
    });
  });

  describe("when folderIds and categoryIds are not changed", () => {
    it("updates the chart and its items", async () => {
      const user = await userFactory.create();
      const chart = await chartFactory.vars({ user: () => user }).create();
      const chartFolder = await chartFolderFactory
        .vars({ user: () => user, chart: () => chart })
        .create();
      const chartCategory = await chartCategoryFactory
        .vars({ user: () => user, chart: () => chart })
        .create();
      await expect(
        updateChart(db)({
          id: chart.id,
          userId: user.id,
          name: "name",
        }),
      ).resolves.toBeUndefined();
      const updatedChart = await db.chart.findFirst({
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
      expect(updatedChart?.chartFolders).toHaveLength(1);
      expect(updatedChart).toStrictEqual({
        userId: user.id,
        name: "name",
        chartCategories: [{ categoryId: chartCategory.categoryId }],
        chartFolders: [{ folderId: chartFolder.folderId }],
      });
    });
  });

  describe("when a user does not have a folder", () => {
    it("throws an error", async () => {
      const user = await userFactory.create();
      const chart = await chartFactory.vars({ user: () => user }).create();
      const folder1 = await folderFactory.vars({ user: () => user }).create();
      const folder2 = await folderFactory.create();
      await expect(
        updateChart(db)({
          id: chart.id,
          userId: user.id,
          name: "name",
          folderIds: [folder1.id, folder2.id],
        }),
      ).rejects.toThrow("The folder does not exist.");
      await expect(
        db.chart.findFirst({
          where: {
            userId: user.id,
          },
        }),
      ).resolves.toStrictEqual(chart);
    });
  });

  describe("when a user does not have a category", () => {
    it("throws an error", async () => {
      const user = await userFactory.create();
      const chart = await chartFactory.vars({ user: () => user }).create();
      const category1 = await categoryFactory
        .vars({ user: () => user })
        .create();
      const category2 = await categoryFactory.create();
      await expect(
        updateChart(db)({
          id: chart.id,
          userId: user.id,
          name: "name",
          categoryIds: [category1.id, category2.id],
        }),
      ).rejects.toThrow("The category does not exist.");
      await expect(
        db.chart.findFirst({
          where: {
            userId: user.id,
          },
        }),
      ).resolves.toStrictEqual(chart);
    });
  });

  describe("when a user does not have a chart", () => {
    it("throws an error", async () => {
      const user = await userFactory.create();
      const chart = await chartFactory.create();
      await expect(
        updateChart(db)({
          id: chart.id,
          userId: user.id,
          name: "name",
        }),
      ).rejects.toThrow("The chart does not exist.");
      await expect(
        db.chart.findFirst({
          where: {
            id: chart.id,
          },
        }),
      ).resolves.toStrictEqual(chart);
    });
  });
});
