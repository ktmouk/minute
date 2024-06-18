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
import { parseISO } from "date-fns";
import { it, describe, vi, expect } from "vitest";
import { getChartDataset } from "./get-chart-dataset";

vi.mock("server-only");

describe("getChartDataset", () => {
  describe("when a user has charts", () => {
    it("returns the chart dataset", async () => {
      const user = await userFactory.create();
      const chart = await chartFactory.vars({ user: () => user }).create();
      const rootFolder = await folderFactory
        .vars({ user: () => user })
        .use((t) => t.root)
        .create();
      const childFolder = await folderFactory
        .vars({ user: () => user })
        .use((t) => t.withAncestor(rootFolder))
        .create();
      await chartFolderFactory
        .vars({
          user: () => user,
          chart: () => chart,
          folder: () => rootFolder,
        })
        .create();
      await chartFolderFactory
        .vars({
          user: () => user,
          chart: () => chart,
          folder: () => childFolder,
        })
        .create();
      const rootTask = await taskFactory
        .vars({ user: () => user, folder: () => rootFolder })
        .create();
      await timeEntryFactory
        .vars({ task: () => rootTask })
        .props({
          duration: () => 300,
          startedAt: () => parseISO("2024-01-01T01:00:00"),
        })
        .createList(3);
      await timeEntryFactory
        .vars({ task: () => rootTask })
        .props({
          duration: () => 100,
          startedAt: () => parseISO("2024-01-02T01:00:00"),
        })
        .createList(4);
      const childTask = await taskFactory
        .vars({ user: () => user, folder: () => childFolder })
        .create();
      await timeEntryFactory
        .vars({ task: () => childTask })
        .props({
          duration: () => 100,
          startedAt: () => parseISO("2024-01-01T01:00:00"),
        })
        .createList(3);
      const category1 = await categoryFactory
        .vars({ user: () => user })
        .create();
      await categoryFolderFactory
        .vars({ folder: () => rootFolder, category: () => category1 })
        .create();
      await categoryFolderFactory
        .vars({ folder: () => childFolder, category: () => category1 })
        .create();
      await chartCategoryFactory
        .vars({
          user: () => user,
          chart: () => chart,
          category: () => category1,
        })
        .create();
      const category2 = await categoryFactory
        .vars({ user: () => user })
        .create();
      await categoryFolderFactory
        .vars({ folder: () => childFolder, category: () => category2 })
        .create();
      await chartCategoryFactory
        .vars({
          user: () => user,
          chart: () => chart,
          category: () => category2,
        })
        .create();
      const expectedFolders = [
        {
          folderId: childFolder.id,
          data: [
            {
              localDate: "2024-01-01",
              duration: 300,
            },
          ],
        },
        {
          folderId: rootFolder.id,
          data: [
            {
              localDate: "2024-01-01",
              duration: 1200,
            },
            {
              localDate: "2024-01-02",
              duration: 400,
            },
          ],
        },
      ];
      const expectedCategories = [
        {
          categoryId: category1.id,
          data: [
            {
              localDate: "2024-01-01",
              duration: 1500,
            },
            {
              localDate: "2024-01-02",
              duration: 400,
            },
          ],
        },
        {
          categoryId: category2.id,
          data: [
            {
              localDate: "2024-01-01",
              duration: 300,
            },
          ],
        },
      ];
      const dataset = await getChartDataset(db)({
        userId: user.id,
        chartId: chart.id,
        startDate: parseISO("2024-01-01T00:00:00"),
        endDate: parseISO("2024-01-07T00:00:00"),
        datePart: "day",
        timeZone: "Asia/Tokyo",
      });
      expect(dataset.folders).toHaveLength(expectedFolders.length);
      expect(dataset.categories).toHaveLength(expectedCategories.length);
      expect(dataset).toStrictEqual({
        categories: expect.arrayContaining(expectedCategories) as unknown,
        folders: expect.arrayContaining(expectedFolders) as unknown,
      });
    });
  });

  describe("when the datePart is month", () => {
    it("returns the chart dataset", async () => {
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
      await timeEntryFactory
        .vars({ task: () => task })
        .props({
          duration: () => 100,
          startedAt: () => parseISO("2024-02-02T02:00:00"),
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
      const expectedFolders = [
        {
          folderId: folder.id,
          data: [
            {
              localDate: "2024-01-01",
              duration: 900,
            },
            {
              localDate: "2024-02-01",
              duration: 300,
            },
          ],
        },
      ];
      const expectedCategories = [
        {
          categoryId: category.id,
          data: [
            {
              localDate: "2024-01-01",
              duration: 900,
            },
            {
              localDate: "2024-02-01",
              duration: 300,
            },
          ],
        },
      ];
      const dataset = await getChartDataset(db)({
        userId: user.id,
        chartId: chart.id,
        startDate: parseISO("2024-01-01T00:00:00"),
        endDate: parseISO("2025-01-01T00:00:00"),
        datePart: "month",
        timeZone: "Asia/Tokyo",
      });
      expect(dataset.folders).toHaveLength(expectedFolders.length);
      expect(dataset.categories).toHaveLength(expectedCategories.length);
      expect(dataset).toStrictEqual({
        categories: expect.arrayContaining(expectedCategories) as unknown,
        folders: expect.arrayContaining(expectedFolders) as unknown,
      });
    });
  });

  describe("when a user does not have timeEntries in the period", () => {
    it("returns the chart dataset", async () => {
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
      const rootTask = await taskFactory
        .vars({ user: () => user, folder: () => folder })
        .create();
      await timeEntryFactory
        .vars({ task: () => rootTask })
        .props({
          duration: () => 300,
          startedAt: () => parseISO("2024-01-02T01:00:00"),
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
      await expect(
        getChartDataset(db)({
          userId: user.id,
          chartId: chart.id,
          startDate: parseISO("2024-01-01T01:00:00"),
          endDate: parseISO("2024-01-01T02:00:00"),
          datePart: "day",
          timeZone: "Asia/Tokyo",
        }),
      ).resolves.toStrictEqual({
        categories: [
          {
            categoryId: category.id,
            data: [],
          },
        ],
        folders: [
          {
            folderId: folder.id,
            data: [],
          },
        ],
      });
    });
  });

  describe.each(
    Intl.supportedValuesOf("timeZone").map((timeZone) => ({ timeZone })),
  )(`when the timeZone is $timeZone`, ({ timeZone }) => {
    it(`supports ${timeZone}`, async () => {
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
      const rootTask = await taskFactory
        .vars({ user: () => user, folder: () => folder })
        .create();
      await timeEntryFactory
        .vars({ task: () => rootTask })
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
      await expect(
        getChartDataset(db)({
          userId: user.id,
          chartId: chart.id,
          startDate: parseISO("2023-12-31T01:00:00"),
          endDate: parseISO("2024-01-07T02:00:00"),
          datePart: "day",
          timeZone,
        }),
      ).resolves.toStrictEqual({
        categories: [
          {
            categoryId: category.id,
            data: expect.any(Object) as unknown,
          },
        ],
        folders: [
          {
            folderId: folder.id,
            data: expect.any(Object) as unknown,
          },
        ],
      });
    });
  });

  describe("when the endDate is less than the startDate", () => {
    it("throws an error", async () => {
      const user = await userFactory.create();
      const chart = await chartFactory.create();
      await expect(
        getChartDataset(db)({
          userId: user.id,
          chartId: chart.id,
          startDate: parseISO("2024-01-01T02:00:00"),
          endDate: parseISO("2024-01-01T01:00:00"),
          datePart: "day",
          timeZone: "Asia/Tokyo",
        }),
      ).rejects.toThrow("The start date must be earlier than end date.");
    });
  });

  describe("when another user have the chart", () => {
    it("throws an error", async () => {
      const user = await userFactory.create();
      const chart = await chartFactory.create();
      await expect(
        getChartDataset(db)({
          userId: user.id,
          chartId: chart.id,
          startDate: parseISO("2024-01-01T01:00:00"),
          endDate: parseISO("2024-01-01T02:00:00"),
          datePart: "day",
          timeZone: "Asia/Tokyo",
        }),
      ).rejects.toThrow("The chart does not exist.");
    });
  });
});
