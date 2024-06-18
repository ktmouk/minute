import "server-only";

import { z } from "zod";

export const timeEntrySummarySchema = z.strictObject({
  folderId: z.string().uuid(),
  duration: z.bigint(),
});

export type TimeEntrySummary = z.infer<typeof timeEntrySummarySchema>;
