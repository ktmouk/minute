import type { PrismaClient } from "@minute/prisma";
import { contract } from "@minute/utils";
import { z } from "zod";

export const deleteChart = (db: PrismaClient) =>
  contract(
    {
      input: z.strictObject({
        id: z.string().uuid(),
        userId: z.string().uuid(),
      }),
      output: z.promise(z.void()),
    },
    async (input) => {
      const chart = await db.chart.findFirst({
        where: {
          id: input.id,
          userId: input.userId,
        },
      });
      if (chart === null) {
        throw Error("The chart does not exist.");
      }
      await db.chart.delete({
        where: {
          id: input.id,
          userId: input.userId,
        },
      });
    },
  );
