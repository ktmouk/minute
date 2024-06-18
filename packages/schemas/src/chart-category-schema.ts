import "server-only";

import type { Prisma } from "@minute/prisma";
import type { ZodType } from "zod";
import { z } from "zod";

export const chartCategorySchema = z.strictObject({
  id: z.string().uuid(),
  chartId: z.string().uuid(),
  categoryId: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
}) satisfies ZodType<Prisma.ChartCategoryUncheckedCreateInput>;

export type ChartCategory = z.infer<typeof chartCategorySchema>;
