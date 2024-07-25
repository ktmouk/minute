import "server-only";

import type { PrismaClient } from "@minute/prisma";
import {
  chartSchema,
  chartFolderSchema,
  chartCategorySchema,
} from "@minute/schemas";
import { contract } from "@minute/utils";
import { z } from "zod";

export const getCharts = (db: PrismaClient) =>
  contract(
    {
      input: z.strictObject({
        userId: z.string().uuid(),
      }),
      output: z.promise(
        z.array(
          chartSchema.extend({
            chartFolders: z.array(chartFolderSchema),
            chartCategories: z.array(chartCategorySchema),
          }),
        ),
      ),
    },
    async (input) => {
      return db.chart.findMany({
        where: {
          userId: input.userId,
        },
        include: {
          chartFolders: true,
          chartCategories: true,
        },
        orderBy: {
          createdAt: "asc",
        },
      });
    },
  );
