import {
  chartSchema,
  chartFolderSchema,
  chartCategorySchema,
} from "@minute/schemas";
import {
  createChart,
  deleteChart,
  getChartDataset,
  getCharts,
  updateChart,
} from "@minute/services";
import { z } from "zod";
import { protectedProcedure } from "../procedures";
import { router } from "../trpc";

export const chartsRouter = router({
  getCharts: protectedProcedure
    .output(
      z.array(
        chartSchema.extend({
          chartFolders: z.array(chartFolderSchema),
          chartCategories: z.array(chartCategorySchema),
        }),
      ),
    )
    .query(async ({ ctx }) => {
      return getCharts(ctx.db)({
        userId: ctx.currentUserId,
      });
    }),

  getChartDataset: protectedProcedure
    .input(
      z.strictObject({
        chartId: z.string().uuid(),
        startDate: z.date(),
        endDate: z.date(),
        datePart: z.enum(["day", "month"]),
        timeZone: z.enum(
          Intl.supportedValuesOf("timeZone") as [string, ...string[]],
        ),
      }),
    )
    .output(
      z.strictObject({
        folders: z.array(
          z.strictObject({
            folderId: z.string().uuid(),
            data: z.array(
              z.strictObject({
                localDate: z.string(),
                duration: z.number(),
              }),
            ),
          }),
        ),
        categories: z.array(
          z.strictObject({
            categoryId: z.string().uuid(),
            data: z.array(
              z.strictObject({
                localDate: z.string(),
                duration: z.number(),
              }),
            ),
          }),
        ),
      }),
    )
    .query(async ({ input, ctx }) => {
      return getChartDataset(ctx.db)({
        userId: ctx.currentUserId,
        chartId: input.chartId,
        startDate: input.startDate,
        endDate: input.endDate,
        datePart: input.datePart,
        timeZone: input.timeZone,
      });
    }),

  createChart: protectedProcedure
    .input(
      z.strictObject({
        name: z.string(),
        folderIds: z.array(z.string().uuid()),
        categoryIds: z.array(z.string().uuid()),
      }),
    )
    .output(z.void())
    .mutation(async ({ input, ctx }) => {
      await createChart(ctx.db)({
        userId: ctx.currentUserId,
        name: input.name,
        folderIds: input.folderIds,
        categoryIds: input.categoryIds,
      });
    }),

  updateChart: protectedProcedure
    .input(
      z.strictObject({
        id: z.string().uuid(),
        name: z.string().optional(),
        folderIds: z.array(z.string().uuid()).optional(),
        categoryIds: z.array(z.string().uuid()).optional(),
      }),
    )
    .output(z.void())
    .mutation(async ({ input, ctx }) => {
      await updateChart(ctx.db)({
        id: input.id,
        userId: ctx.currentUserId,
        name: input.name,
        folderIds: input.folderIds,
        categoryIds: input.categoryIds,
      });
    }),

  deleteChart: protectedProcedure
    .input(
      z.strictObject({
        id: z.string().uuid(),
      }),
    )
    .output(z.void())
    .mutation(async ({ input, ctx }) => {
      await deleteChart(ctx.db)({
        id: input.id,
        userId: ctx.currentUserId,
      });
    }),
});
