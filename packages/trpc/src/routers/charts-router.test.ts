import {
  categoryFactory,
  categoryFolderFactory,
  chartCategoryFactory,
  chartFactory,
  chartFolderFactory,
  folderFactory,
  taskFactory,
  timeEntryFactory,
  userFactory,
} from "@minute/prisma/vitest/factories";
import { db } from "@minute/prisma/vitest/helpers";
import { TRPCError } from "@trpc/server";
import { parseISO } from "date-fns";
import { it, describe, vi, expect } from "vitest";
import { createInnerContext } from "../context";
import { createCaller } from ".";

vi.mock("server-only");

describe("chartsRouter", () => {
  describe("#getCharts", () => {
    describe("when a user is not logged in", () => {
      it("throws an error", async () => {
        const caller = createCaller(
          createInnerContext({ db, currentUserId: undefined }),
        );
        await expect(caller.charts.getCharts()).rejects.toThrow(
          new TRPCError({ code: "UNAUTHORIZED" }),
        );
      });
    });

    describe("when a user has charts", () => {
      it("returns chars", async () => {
        const user = await userFactory.create();
        const chart = await chartFactory.vars({ user: () => user }).create();
        const chartFolder = await chartFolderFactory
          .vars({ user: () => user, chart: () => chart })
          .create();
        const chartCategory = await chartCategoryFactory
          .vars({ user: () => user, chart: () => chart })
          .create();
        const caller = createCaller(
          createInnerContext({ db, currentUserId: user.id }),
        );
        await expect(caller.charts.getCharts()).resolves.toStrictEqual([
          {
            id: chart.id,
            userId: user.id,
            type: "LINE",
            name: chart.name,
            chartFolders: [
              {
                id: chartFolder.id,
                chartId: chart.id,
                folderId: chartFolder.folderId,
                createdAt: chartFolder.createdAt,
                updatedAt: chartFolder.updatedAt,
              },
            ],
            chartCategories: [
              {
                id: chartCategory.id,
                chartId: chart.id,
                categoryId: chartCategory.categoryId,
                createdAt: chartCategory.createdAt,
                updatedAt: chartCategory.updatedAt,
              },
            ],
            createdAt: chart.createdAt,
            updatedAt: chart.updatedAt,
          },
        ]);
      });
    });

    describe("when another user has charts", () => {
      it("returns an empty array", async () => {
        const user = await userFactory.create();
        await chartFactory.create();
        const caller = createCaller(
          createInnerContext({ db, currentUserId: user.id }),
        );
        await expect(caller.charts.getCharts()).resolves.toStrictEqual([]);
      });
    });
  });

  describe("#getChartDataset", () => {
    describe("when a user is not logged in", () => {
      it("throws an error", async () => {
        const caller = createCaller(
          createInnerContext({ db, currentUserId: undefined }),
        );
        const chart = await chartFactory.create();
        await expect(
          caller.charts.getChartDataset({
            chartId: chart.id,
            startDate: parseISO("2024-01-01T01:23:45"),
            endDate: parseISO("2024-01-01T02:23:45"),
            timeZone: "Asia/Tokyo",
            datePart: "day",
          }),
        ).rejects.toThrow(new TRPCError({ code: "UNAUTHORIZED" }));
      });
    });

    describe("when a user has charts", () => {
      it("returns chars", async () => {
        const user = await userFactory.create();
        const chart = await chartFactory.vars({ user: () => user }).create();
        const folder = await folderFactory
          .vars({ user: () => user })
          .use((t) => t.root)
          .create();
        await chartFolderFactory
          .vars({
            user: () => user,
            chart: () => chart,
            folder: () => folder,
          })
          .create();
        const task = await taskFactory
          .vars({ user: () => user, folder: () => folder })
          .create();
        await timeEntryFactory
          .vars({ task: () => task })
          .props({
            duration: () => 300,
            startedAt: () => parseISO("2024-01-01T01:00:00"),
          })
          .createList(3);
        const category = await categoryFactory
          .vars({ user: () => user })
          .create();
        await categoryFolderFactory
          .vars({ folder: () => folder, category: () => category })
          .create();
        await chartCategoryFactory
          .vars({
            user: () => user,
            chart: () => chart,
            category: () => category,
          })
          .create();
        const caller = createCaller(
          createInnerContext({ db, currentUserId: user.id }),
        );
        await expect(
          caller.charts.getChartDataset({
            chartId: chart.id,
            startDate: parseISO("2024-01-01T01:00:00"),
            endDate: parseISO("2024-01-01T02:00:00"),
            timeZone: "Asia/Tokyo",
            datePart: "day",
          }),
        ).resolves.toStrictEqual({
          categories: [
            {
              categoryId: category.id,
              data: [
                {
                  localDate: "2024-01-01",
                  duration: 900,
                },
              ],
            },
          ],
          folders: [
            {
              folderId: folder.id,
              data: [
                {
                  localDate: "2024-01-01",
                  duration: 900,
                },
              ],
            },
          ],
        });
      });
    });

    describe("when another user has charts", () => {
      it("returns an empty array", async () => {
        const user = await userFactory.create();
        const chart = await chartFactory.create();
        const caller = createCaller(
          createInnerContext({ db, currentUserId: user.id }),
        );
        await expect(
          caller.charts.getChartDataset({
            chartId: chart.id,
            startDate: parseISO("2024-01-01T01:00:00"),
            endDate: parseISO("2024-01-01T02:00:00"),
            timeZone: "Asia/Tokyo",
            datePart: "day",
          }),
        ).rejects.toThrow("The chart does not exist.");
      });
    });
  });

  describe("#createChart", () => {
    describe("when a user is not logged in", () => {
      it("throws an error", async () => {
        const caller = createCaller(
          createInnerContext({ db, currentUserId: undefined }),
        );
        await expect(
          caller.charts.createChart({
            name: "name",
            folderIds: [],
            categoryIds: [],
          }),
        ).rejects.toThrow(new TRPCError({ code: "UNAUTHORIZED" }));
      });
    });

    describe("when a user has a folder", () => {
      it("creates a chart", async () => {
        const user = await userFactory.create();
        const folders = await folderFactory
          .vars({ user: () => user })
          .createList(3);
        const categories = await categoryFactory
          .vars({ user: () => user })
          .createList(3);
        const caller = createCaller(
          createInnerContext({ db, currentUserId: user.id }),
        );
        await expect(
          caller.charts.createChart({
            name: "name",
            folderIds: folders.map(({ id }) => id),
            categoryIds: categories.map(({ id }) => id),
          }),
        ).resolves.toBeUndefined();
        const chart = await db.chart.findFirst({
          select: {
            userId: true,
            name: true,
            chartFolders: {
              select: {
                folderId: true,
              },
            },
            chartCategories: {
              select: {
                categoryId: true,
              },
            },
          },
          where: {
            userId: user.id,
          },
        });
        expect(chart?.chartFolders).toHaveLength(3);
        expect(chart?.chartCategories).toHaveLength(3);
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
        const folder = await folderFactory.create();
        const caller = createCaller(
          createInnerContext({ db, currentUserId: user.id }),
        );
        await expect(
          caller.charts.createChart({
            name: "name",
            folderIds: [folder.id],
            categoryIds: [],
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
        const category = await categoryFactory.create();
        const caller = createCaller(
          createInnerContext({ db, currentUserId: user.id }),
        );
        await expect(
          caller.charts.createChart({
            name: "name",
            folderIds: [],
            categoryIds: [category.id],
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
  });

  describe("#updateChart", () => {
    describe("when a user is not logged in", () => {
      it("throws an error", async () => {
        const chart = await chartFactory.create();
        const caller = createCaller(
          createInnerContext({ db, currentUserId: undefined }),
        );
        await expect(
          caller.charts.updateChart({
            id: chart.id,
            name: "name",
          }),
        ).rejects.toThrow(new TRPCError({ code: "UNAUTHORIZED" }));
      });
    });

    describe("when a user has a folder and a category", () => {
      it("creates a chart", async () => {
        const user = await userFactory.create();
        const chart = await chartFactory.vars({ user: () => user }).create();
        await chartCategoryFactory
          .vars({ user: () => user, chart: () => chart })
          .create();
        await chartFolderFactory
          .vars({ user: () => user, chart: () => chart })
          .create();
        const folders = await folderFactory
          .vars({ user: () => user })
          .createList(3);
        const categories = await categoryFactory
          .vars({ user: () => user })
          .createList(2);
        const caller = createCaller(
          createInnerContext({ db, currentUserId: user.id }),
        );
        await expect(
          caller.charts.updateChart({
            id: chart.id,
            name: "name",
            folderIds: folders.map(({ id }) => id),
            categoryIds: categories.map(({ id }) => id),
          }),
        ).resolves.toBeUndefined();
        const updatedChart = await db.chart.findFirst({
          select: {
            userId: true,
            name: true,
            chartFolders: {
              select: {
                folderId: true,
              },
            },
            chartCategories: {
              select: {
                categoryId: true,
              },
            },
          },
          where: {
            userId: user.id,
          },
        });
        expect(updatedChart?.chartCategories).toHaveLength(2);
        expect(updatedChart?.chartFolders).toHaveLength(3);
        expect(updatedChart).toStrictEqual({
          userId: user.id,
          name: "name",
          chartCategories: expect.arrayContaining(
            categories.map(({ id }) => ({ categoryId: id })),
          ) as unknown,
          chartFolders: expect.arrayContaining(
            folders.map(({ id }) => ({ folderId: id })),
          ) as unknown,
        });
      });
    });

    describe("when a user does not have a folder", () => {
      it("throws an error", async () => {
        const user = await userFactory.create();
        const chart = await chartFactory.vars({ user: () => user }).create();
        await chartFolderFactory
          .vars({ user: () => user, chart: () => chart })
          .create();
        const folder = await folderFactory.create();
        const caller = createCaller(
          createInnerContext({ db, currentUserId: user.id }),
        );
        await expect(
          caller.charts.updateChart({
            id: chart.id,
            name: "name",
            folderIds: [folder.id],
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
        await chartCategoryFactory
          .vars({ user: () => user, chart: () => chart })
          .create();
        const category = await categoryFactory.create();
        const caller = createCaller(
          createInnerContext({ db, currentUserId: user.id }),
        );
        await expect(
          caller.charts.updateChart({
            id: chart.id,
            name: "name",
            categoryIds: [category.id],
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
        const caller = createCaller(
          createInnerContext({ db, currentUserId: user.id }),
        );
        await expect(
          caller.charts.updateChart({
            id: chart.id,
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

  describe("#deleteChart", () => {
    describe("when a user is not logged in", () => {
      it("throws an error", async () => {
        const chart = await chartFactory.create();
        const caller = createCaller(
          createInnerContext({ db, currentUserId: undefined }),
        );
        await expect(
          caller.charts.deleteChart({
            id: chart.id,
          }),
        ).rejects.toThrow(new TRPCError({ code: "UNAUTHORIZED" }));
      });
    });

    describe("when a user has the chart", () => {
      it("deletes the chart", async () => {
        const user = await userFactory.create();
        const chart = await chartFactory.vars({ user: () => user }).create();
        await chartFolderFactory
          .vars({ user: () => user, chart: () => chart })
          .create();
        const caller = createCaller(
          createInnerContext({ db, currentUserId: user.id }),
        );
        await expect(
          caller.charts.deleteChart({
            id: chart.id,
          }),
        ).resolves.toBeUndefined();
        await expect(
          db.chart.findFirst({
            where: {
              userId: user.id,
            },
          }),
        ).resolves.toBeNull();
      });
    });

    describe("when a user does not have a chart", () => {
      it("throws an error", async () => {
        const user = await userFactory.create();
        const chart = await chartFactory.create();
        await chartFolderFactory
          .vars({ user: () => user, chart: () => chart })
          .create();
        const caller = createCaller(
          createInnerContext({ db, currentUserId: user.id }),
        );
        await expect(
          caller.charts.deleteChart({
            id: chart.id,
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
});
