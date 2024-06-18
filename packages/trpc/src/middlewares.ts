import "server-only";

import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { middleware } from "./trpc";

const isUuid = (id: string) => {
  return z.string().uuid().safeParse(id).success;
};

export const isAuthed = middleware(({ ctx, next }) => {
  const { currentUserId } = ctx;

  if (typeof currentUserId !== "string" || !isUuid(currentUserId)) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({
    ctx: { currentUserId },
  });
});
