import "server-only";

import type { Prisma } from "@minute/prisma";
import type { ZodType } from "zod";
import { z } from "zod";

export const userSchema = z.strictObject({
  id: z.string().uuid(),
  name: z.string().nullable(),
  image: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
}) satisfies ZodType<Prisma.UserUncheckedCreateInput>;

export type User = z.infer<typeof userSchema>;
