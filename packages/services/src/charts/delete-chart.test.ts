import {
  chartFactory,
  chartFolderFactory,
  userFactory,
} from "@minute/prisma/vitest/factories";
import { db } from "@minute/prisma/vitest/helpers";
import { it, describe, vi, expect } from "vitest";
import { deleteChart } from "./delete-chart";

vi.mock("server-only");

describe("deleteChart", () => {
  describe("when a user has the chart", () => {
    it("deletes the chart and its items", async () => {
      const user = await userFactory.create();
      const chart = await chartFactory.vars({ user: () => user }).create();
      const chartFolder = await chartFolderFactory
        .vars({ user: () => user, chart: () => chart })
        .create();
      await expect(
        deleteChart(db)({
          id: chart.id,
          userId: user.id,
        }),
      ).resolves.toBeUndefined();
      await expect(
        db.chart.findFirst({
          where: {
            id: chart.id,
          },
        }),
      ).resolves.toBeNull();
      await expect(
        db.chartFolder.findFirst({
          where: {
            id: chartFolder.id,
          },
        }),
      ).resolves.toBeNull();
    });
  });

  describe("when a user does not have the chart", () => {
    it("throws an error", async () => {
      const user = await userFactory.create();
      const chart = await chartFactory.create();
      await expect(
        deleteChart(db)({
          id: chart.id,
          userId: user.id,
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
