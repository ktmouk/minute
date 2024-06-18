import { folderHierarchySchema } from "@minute/schemas";
import { getFolderHierarchies } from "@minute/services";
import { z } from "zod";
import { protectedProcedure } from "../procedures";
import { router } from "../trpc";

export const folderHierarchiesRouter = router({
  getFolderHierarchies: protectedProcedure
    .output(z.array(folderHierarchySchema))
    .query(async ({ ctx }) => {
      return await getFolderHierarchies(ctx.db)({
        userId: ctx.currentUserId,
      });
    }),
});
