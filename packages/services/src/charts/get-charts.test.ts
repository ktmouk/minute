import {
  chartCategoryFactory,
  chartFactory,
  chartFolderFactory,
  userFactory,
} from "@minute/prisma/vitest/factories";
import { db } from "@minute/prisma/vitest/helpers";
import { it, describe, vi, expect } from "vitest";
import { getCharts } from "./get-charts";

vi.mock("server-only");

describe("getCharts", () => {
  describe("when a user has charts", () => {
    it("returns charts", async () => {
      const user = await userFactory.create();
      const chart = await chartFactory.vars({ user: () => user }).create();
      const chartCategory = await chartCategoryFactory
        .vars({ user: () => user, chart: () => chart })
        .create();
      const chartFolder = await chartFolderFactory
        .vars({ user: () => user, chart: () => chart })
        .create();
      await expect(
        getCharts(db)({
          userId: user.id,
        }),
      ).resolves.toStrictEqual([
        {
          id: chart.id,
          userId: user.id,
          type: "LINE",
          name: chart.name,
          createdAt: chart.createdAt,
          updatedAt: chart.updatedAt,
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
        },
      ]);
    });
  });

  describe("when another user has charts", () => {
    it("returns an empty array", async () => {
      const user = await userFactory.create();
      await chartFactory.create();
      await expect(
        getCharts(db)({
          userId: user.id,
        }),
      ).resolves.toStrictEqual([]);
    });
  });
});
