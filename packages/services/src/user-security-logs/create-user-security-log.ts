import type { PrismaClient } from "@minute/prisma";
import { contract, omitUndefined } from "@minute/utils";
import { z } from "zod";

export const createUserSecurityLog = (db: PrismaClient) =>
  contract(
    {
      input: z.strictObject({
        type: z.enum([
          "SIGN_IN",
          "SIGN_OUT",
          "LINK_ACCOUNT",
          "CREATE_USER",
          "BLOCK_SIGN_IN",
        ]),
        name: z.string().optional(),
        provider: z.string().optional(),
        providerAccountId: z.string().optional(),
        userAgent: z.string().optional(),
        ipAddress: z.string().ip().optional(),
      }),
      output: z.promise(z.void()),
    },
    async (input) => {
      await db.userSecurityLog.create({
        data: omitUndefined({
          name: input.name,
          provider: input.provider,
          providerAccountId: input.providerAccountId,
          type: input.type,
          userAgent: input.userAgent,
          ipAddress: input.ipAddress,
        }),
      });
    },
  );
