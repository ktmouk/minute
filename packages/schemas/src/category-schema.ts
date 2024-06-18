import "server-only";

import type { Prisma } from "@minute/prisma";
import type { ZodType } from "zod";
import { z } from "zod";

export const MIN_CATEGORY_NAME = 1;
export const MAX_CATEGORY_NAME = 50;

export const MIN_CATEGORY_EMOJI = 1;
export const MAX_CATEGORY_EMOJI = 50;

export const CATEGORY_COLOR_REGEXP = /^#[0-9a-f]{6}$/;

export const categorySchema = z.strictObject({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  color: z.string(),
  name: z.string(),
  emoji: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
}) satisfies ZodType<Prisma.CategoryUncheckedCreateInput>;

export type Category = z.infer<typeof categorySchema>;
