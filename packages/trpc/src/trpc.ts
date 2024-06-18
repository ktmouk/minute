import "server-only";

import { initTRPC } from "@trpc/server";
import superjson from "superjson";
import type { createInnerContext } from "./context";

const trpc = initTRPC.context<typeof createInnerContext>().create({
  transformer: superjson,
  errorFormatter({ shape }) {
    // Hide a message to avoid exposing server issues.
    return { ...shape, message: "" };
  },
});

export const { router, procedure, middleware, createCallerFactory } = trpc;
