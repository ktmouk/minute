import "server-only";

import { appRouter, createInnerContext } from "@minute/trpc";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { getServerSession } from "next-auth";
import { db } from "../../../../../config/db";
import { authOptions } from "../../../../../config/next-auth";

const createContext = async () => {
  // https://next-auth.js.org/configuration/nextjs#in-app-router
  const session = await getServerSession(authOptions);

  return createInnerContext({
    currentUserId: session?.user.id,
    db,
  });
};

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext,
  });

export { handler as GET, handler as POST };
