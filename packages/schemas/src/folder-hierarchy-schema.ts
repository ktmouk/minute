import "server-only";

import type { Prisma } from "@minute/prisma";
import type { ZodType } from "zod";
import { z } from "zod";

export const folderHierarchySchema = z.strictObject({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  ancestorId: z.string().uuid().nullable(),
  descendantId: z.string().uuid(),
  depth: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
}) satisfies ZodType<Prisma.FolderHierarchyUncheckedCreateInput>;

export type FolderHierarchy = z.infer<typeof folderHierarchySchema>;
