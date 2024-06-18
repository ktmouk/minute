import { timeEntrySummarySchema } from "@minute/schemas";
import { getTimeEntrySummary } from "@minute/services";
import { z } from "zod";
import { protectedProcedure } from "../procedures";
import { router } from "../trpc";

export const timeEntrySummariesRouter = router({
  getTimeEntrySummary: protectedProcedure
    .input(
      z.strictObject({
        date: z.date(),
      }),
    )
    .output(z.array(timeEntrySummarySchema))
    .query(async ({ input, ctx }) => {
      return await getTimeEntrySummary(ctx.db)({
        userId: ctx.currentUserId,
        date: input.date,
      });
    }),
});
