import "server-only";

import type { PrismaClient } from "@minute/prisma";
import { MAX_CHART_NAME, MIN_CHART_NAME } from "@minute/schemas";
import { contract, omitUndefined } from "@minute/utils";
import { z } from "zod";

export const updateChart = (db: PrismaClient) =>
  contract(
    {
      input: z.strictObject({
        id: z.string().uuid(),
        userId: z.string().uuid(),
        name: z.string().min(MIN_CHART_NAME).max(MAX_CHART_NAME).optional(),
        folderIds: z.array(z.string().uuid()).optional(),
        categoryIds: z.array(z.string().uuid()).optional(),
      }),
      output: z.promise(z.void()),
    },
    async (input) => {
      const chart = await db.chart.findFirst({
        where: {
          id: input.id,
          userId: input.userId,
        },
        include: {
          chartFolders: true,
          chartCategories: true,
        },
      });
      if (chart === null) {
        throw Error("The chart does not exist.");
      }
      const folderIds =
        input.folderIds ?? chart.chartFolders.map(({ folderId }) => folderId);
      const folders = await db.folder.findMany({
        select: {
          id: true,
          userId: true,
        },
        where: {
          id: { in: folderIds },
          userId: input.userId,
        },
      });
      if (
        folders.length !== folderIds.length ||
        folders.filter(
          ({ id, userId }) =>
            userId !== input.userId || !folderIds.includes(id),
        ).length > 0
      ) {
        throw Error("The folder does not exist.");
      }
      const categoryIds =
        input.categoryIds ??
        chart.chartCategories.map(({ categoryId }) => categoryId);
      const categories = await db.category.findMany({
        select: {
          id: true,
          userId: true,
        },
        where: {
          id: { in: categoryIds },
          userId: input.userId,
        },
      });
      if (
        categories.length !== categoryIds.length ||
        categories.filter(
          ({ id, userId }) =>
            userId !== input.userId || !categoryIds.includes(id),
        ).length > 0
      ) {
        throw Error("The category does not exist.");
      }
      await db.$transaction(async (tx) => {
        const chart = await tx.chart.update({
          data: omitUndefined({
            name: input.name,
          }),
          where: {
            id: input.id,
            userId: input.userId,
          },
        });
        await tx.chartFolder.deleteMany({
          where: {
            chartId: chart.id,
          },
        });
        await tx.chartFolder.createMany({
          data: folders.map(({ id }) => ({
            folderId: id,
            chartId: chart.id,
          })),
        });
        await tx.chartCategory.deleteMany({
          where: {
            chartId: chart.id,
          },
        });
        await tx.chartCategory.createMany({
          data: categories.map(({ id }) => ({
            categoryId: id,
            chartId: chart.id,
          })),
        });
      });
    },
  );
