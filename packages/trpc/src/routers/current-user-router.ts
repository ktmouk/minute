import { userSchema } from "@minute/schemas";
import { getUser } from "@minute/services";
import { protectedProcedure } from "../procedures";
import { router } from "../trpc";

export const currentUserRouter = router({
  getCurrentUser: protectedProcedure
    .output(userSchema)
    .query(async ({ ctx }) => {
      return await getUser(ctx.db)({
        userId: ctx.currentUserId,
      });
    }),
});
