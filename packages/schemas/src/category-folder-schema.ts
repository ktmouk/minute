import "server-only";

import type { Prisma } from "@minute/prisma";
import type { ZodType } from "zod";
import { z } from "zod";

export const categoryFolderSchema = z.strictObject({
  id: z.string().uuid(),
  categoryId: z.string().uuid(),
  folderId: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
}) satisfies ZodType<Prisma.CategoryFolderUncheckedCreateInput>;

export type CategoryFolder = z.infer<typeof categoryFolderSchema>;
