import "server-only";

import type { PrismaClient } from "@minute/prisma";
import { MAX_CHART_NAME, MIN_CHART_NAME } from "@minute/schemas";
import { contract } from "@minute/utils";
import { z } from "zod";

export const createChart = (db: PrismaClient) =>
  contract(
    {
      input: z.strictObject({
        userId: z.string().uuid(),
        name: z.string().min(MIN_CHART_NAME).max(MAX_CHART_NAME),
        folderIds: z.array(z.string().uuid()),
        categoryIds: z.array(z.string().uuid()),
      }),
      output: z.promise(z.void()),
    },
    async (input) => {
      const folders = await db.folder.findMany({
        select: {
          id: true,
          userId: true,
        },
        where: {
          id: { in: input.folderIds },
          userId: input.userId,
        },
      });
      if (
        folders.length !== input.folderIds.length ||
        folders.filter(
          ({ id, userId }) =>
            userId !== input.userId || !input.folderIds.includes(id),
        ).length > 0
      ) {
        throw Error("The folder does not exist.");
      }
      const categories = await db.category.findMany({
        select: {
          id: true,
          userId: true,
        },
        where: {
          id: { in: input.categoryIds },
          userId: input.userId,
        },
      });
      if (
        categories.length !== input.categoryIds.length ||
        categories.filter(
          ({ id, userId }) =>
            userId !== input.userId || !input.categoryIds.includes(id),
        ).length > 0
      ) {
        throw Error("The category does not exist.");
      }
      await db.$transaction(async (tx) => {
        const chart = await tx.chart.create({
          data: {
            userId: input.userId,
            type: "LINE",
            name: input.name,
          },
        });
        await tx.chartFolder.createMany({
          data: folders.map(({ id }) => ({
            folderId: id,
            chartId: chart.id,
          })),
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
