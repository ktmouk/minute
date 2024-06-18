import { getTotalTimeEntryDuration } from "@minute/services";
import { z } from "zod";
import { protectedProcedure } from "../procedures";
import { router } from "../trpc";

export const totalTimeEntryDurationRouter = router({
  getTotalTimeEntryDuration: protectedProcedure
    .output(z.number())
    .query(async ({ ctx }) => {
      return await getTotalTimeEntryDuration(ctx.db)({
        userId: ctx.currentUserId,
      });
    }),
});
